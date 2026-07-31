import { useEffect } from "react";

export default function usePasteCleaner() {
    useEffect(() => {
        const handlePaste = (e) => {
            const target = e.target;

            if (
                target.tagName !== "INPUT" &&
                target.tagName !== "TEXTAREA"
            ) {
                return;
            }

            if (
                target.type &&
                ["number", "file", "checkbox", "radio"].includes(target.type)
            ) {
                return;
            }

            e.preventDefault();

            let text = e.clipboardData.getData("text/plain");

            text = text
                .replace(/\r\n/g, "\n")
                .replace(/\u00A0/g, " ")
                .replace(/[ \t]+/g, " ")
                .trim();

            const start = target.selectionStart;
            const end = target.selectionEnd;

            const value = target.value;

            const newValue =
                value.substring(0, start) +
                text +
                value.substring(end);

            const nativeSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value"
            )?.set;

            const textareaSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype,
                "value"
            )?.set;

            if (target.tagName === "TEXTAREA") {
                textareaSetter.call(target, newValue);
            } else {
                nativeSetter.call(target, newValue);
            }

            target.dispatchEvent(
                new Event("input", { bubbles: true })
            );

            requestAnimationFrame(() => {
                const cursor = start + text.length;
                target.selectionStart = cursor;
                target.selectionEnd = cursor;
            });
        };

        document.addEventListener("paste", handlePaste);

        return () => {
            document.removeEventListener("paste", handlePaste);
        };
    }, []);
}