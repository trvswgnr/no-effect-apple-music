import { Result } from "./option-result";

export const Browser = class {
    static open = (url: URL) => Result.of<void>(() => {});
};
