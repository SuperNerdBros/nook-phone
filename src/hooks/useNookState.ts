import { useState, useEffect } from "react";
import { nookState, NookOSState } from "@/lib/nookState";

export function useNookState(): NookOSState {
  const [state, setState] = useState<NookOSState>(() => nookState.getState());

  useEffect(() => {
    const unsubscribe = nookState.subscribe((updatedState) => {
      // Create a shallow copy of the state object to trigger React re-renders
      setState({ ...updatedState });
    });
    return unsubscribe;
  }, []);

  return state;
}

export { nookState };
