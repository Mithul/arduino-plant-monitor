import { DEFAULT_DATA_OBJECT } from '../constants';
import React, {useEffect} from "react";

// Get default/empty object
export const getDefaultDataObject = () => {
  return JSON.parse(JSON.stringify(DEFAULT_DATA_OBJECT));
};

// custom hook for polling
export const useInterval = (callback, delay) => {
  const savedCallback = React.useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
