
import { useState, useEffect } from 'react';

function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
     const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
             try {
                setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
             } catch (error) {
                 console.error(error);
                 setStoredValue(initialValue);
             }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
