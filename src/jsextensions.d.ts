interface Array<T> {
    /**
     * Makes a shallow copy of the array.
     * 
     * @returns A shallow copy of the array.
     */
    clone(): T[]
    /**
     * Checks whether the array contains a given element.
     * 
     * @param element The element to search for.
     * @returns True if the array contains a given element.
     * @deprecated includes() should be used instead.
     */
    contains(element: T): boolean
    /**
     * Checks whether the two arrays are the same.
     * 
     * @param array The array to compare to.
     * @returns True if the two arrays are the same.
     */
    equals(array: T[]): boolean
    /**
     * Removes a given element from the array (in place).
     * 
     * @param element The element to remove.
     * @returns The array after remove.
     */
    remove(element: T): T[]
}

interface Number {
    /**
     * Generates a random integer in the range (0, max-1).
     * 
     * @param max The upper boundary (excluded).
     * @returns A random integer.
     */
    randomInt(max: number): number
    /**
     * Returns a number whose value is limited to the given range.
     * 
     * @param min The lower boundary.
     * @param max The upper boundary.
     * @returns A number in the range (min, max).
     */
    clamp(min: number, max: number): number
    /**
     * Returns a modulo value which is always positive.
     * 
     * @param n The divisor.
     * @returns a modulo value.
     */
    mod(n: number): number
    /**
     * Makes a number string with leading zeros.
     * 
     * @param length The length of the output string.
     * @returns A string with leading zeros.
     */
    padZero(length: number): string
}

interface String {
    /**
     * Checks whether the string contains a given string.
     * 
     * @param string The string to search for.
     * @returns True if the string contains a given string.
     * @deprecated includes() should be used instead.
     */
    contains(string: string): boolean
    /**
     * Replaces %1, %2 and so on in the string to the arguments.
     * 
     * @param args The objects to format.
     * @returns A formatted string.
     */
    format(...args: any): string
    /**
     * Makes a number string with leading zeros.
     * 
     * @param length The length of the output string.
     * @returns A string with leading zeros.
     */
    padZero(length: number): string
}
