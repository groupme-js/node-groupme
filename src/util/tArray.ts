// import { AssertionError } from "assert";

// export default function tArray<T>(transformer: (json: any) => T): (array: any) => T[] {
//     return (obj: any): T[] => {
//         if (!Array.isArray(obj)) throw new AssertionError({ message: 'Expected object to be an array.', actual: obj, expected: 'T[]' });
//         const arr: T[] = [];
//         obj.forEach(value => arr.push(transformer(value)));
//         return arr;
//     }
// }
