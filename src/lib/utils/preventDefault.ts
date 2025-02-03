export default function preventDefault(fn: (e) => void) {
    return (e) => {
        e.preventDefault();
        fn(e);
    }
}