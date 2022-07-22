import { useEffect } from "react";

export default function clickOutsideHandler (ref, callbackOnClickOutside) {

    const handleClickOutside = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
            callbackOnClickOutside();
        }
    }

    // useEffect(() => {
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     }
    // }, [ref, callbackOnClickOutside])
}