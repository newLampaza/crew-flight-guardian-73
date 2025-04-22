
import * as React from "react"
import { 
  Toast,
  ToastActionElement, 
  ToastClose, 
  ToastDescription, 
  ToastProvider, 
  ToastTitle, 
  ToastViewport 
} from "@/components/ui/toast"

import { 
  type ToastProps
} from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast> & { id: string }
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [
          action.toast,
          ...state.toasts
        ].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id
            ? { ...t, ...action.toast }
            : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: ((state: State) => void)[] = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type ToastOptions = Omit<ToasterToast, "id">

// Base toast function
function toastFunction(options: ToastOptions) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    })
  
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...options,
      id,
      open: true,
      duration: options.duration || TOAST_REMOVE_DELAY,
      onOpenChange: (open) => {
        if (!open) dismiss()
        if (options.onOpenChange) options.onOpenChange(open)
      },
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

// Default toast duration in milliseconds
const DEFAULT_DURATION = 5000;

// Extended toast function with helper methods
export const toast = Object.assign(toastFunction, {
  // Standard toast
  default(message: string, title?: string, duration = DEFAULT_DURATION) {
    return toastFunction({
      title,
      description: message,
      duration,
      variant: "default",
    });
  },
  
  // Success toast
  success(message: string, title?: string, duration = DEFAULT_DURATION) {
    return toastFunction({
      title: title || "Успешно",
      description: message,
      duration,
      variant: "success",
    });
  },
  
  // Error toast
  error(message: string, title?: string, duration = DEFAULT_DURATION) {
    return toastFunction({
      title: title || "Ошибка",
      description: message,
      duration,
      variant: "destructive",
    });
  },
  
  // Warning toast
  warning(message: string, title?: string, duration = DEFAULT_DURATION) {
    return toastFunction({
      title: title || "Предупреждение",
      description: message,
      duration,
      variant: "warning",
    });
  },
  
  // Info toast
  info(message: string, title?: string, duration = DEFAULT_DURATION) {
    return toastFunction({
      title: title || "Информация",
      description: message,
      duration,
      variant: "info",
    });
  },
});

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast: toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  }
}

export { useToast }
