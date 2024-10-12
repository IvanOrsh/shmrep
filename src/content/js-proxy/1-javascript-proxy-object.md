---
title: 'JavaScript Proxy Object'
description: 'Introduction into JavaScript Proxy Objects'
chapterNumber: 1
---

## What is a JS object?

Nice definition:

A JavaScript object is **a collection of key-value pairs** where **each key (also known as a property or attribute) is a string, and each value can be any valid JavaScript data type**, including numbers, strings, arrays, functions, and other objects. Objects are fundamental to JavaScript and are used to represent complex data structures and encapsulate functionality, enabling the organization and manipulation of related data and behavior within a single entity.

JS object:

```js
const customer = {
	firstName: '',
	lastName: '',
	formatName() {
		//...
	},
};
```

Under the hood, JavaScript objects are implemented as dynamic collections of properties.

1. **Property Map (Hidden Classes):**

   - JavaScript engines often use hidden classes or similar structures to optimize property access. When an object is created, the engine assigns it a hidden class based on its initial properties. As properties are added or removed, the hidden class can change, but the engine tries to optimize for common patterns.

2. **Property Storage:**

   - Properties of an object are typically stored in a hash table, which allows for efficient lookups, additions, and deletions. This hash table maps property names (keys) to property values.
   - Some engines may also use inline caches or other techniques to optimize frequently accessed properties, reducing the need to look them up in the hash table repeatedly.

3. **Prototype Chain:**
   - Each object in JavaScript has an internal link to another object, called its prototype. This chain of prototypes allows for inheritance of properties and methods. When a property is accessed, the engine first looks in the object itself, and if it doesn't find it, it traverses up the prototype chain until it finds the property or reaches the end of the chain.

## Then, what is a Proxy?

A Proxy in JavaScript is a powerful and versatile object that allows you to **intercept and customize fundamental operations on objects**, such as property access, assignment, enumeration, function invocation, and more. By defining handler functions (called traps) for various operations, you can control and modify the behavior of objects in a flexible and dynamic way.

**Key Concepts of Proxy**:

1. **Proxy Object:**

   - A Proxy object wraps around a target object and intercepts operations performed on it through traps defined in a handler object.

2. **Target Object:**

   - This is the object that the proxy virtualizes. The target object can be any kind of object, including arrays, functions, or even other proxies.

3. **Handler Object:**
   - This object contains traps. Traps are methods that provide property access, assignment, enumeration, function invocation, and other behaviors.

```txt

Proxy
------------------------------
customer  | handler (facade)
          |
firstName |  get {},
lastName  |  set {},
formatName|  apply {},
...       |  ...

```

```ts
function createLoggingProxy<T>(target: T): T {
	const handler: ProxyHandler<T> = {
		get(target, property) {
			console.log(`Getting ${String(property)}`);
			return target[property as keyof T];
		},
		set(target, property, value) {
			console.log(`Setting ${String(property)} to ${value}`);
			target[property as keyof T] = value;
			return true;
		},
	};
	return new Proxy<T>(target, handler);
}

const proxyPerson = createLoggingProxy<Person>(person);
```

## What can be wrapped with a Proxy?

**Can't Use Proxy, not an 'Object'**:

```js
const number = 25;
const final = false;
const name = 'One';
const value = null;
let item; // indefined
const id = Symbol(1500);
```

---

**Can Use Proxy, they are 'Object's**:

```js
const invoice = {
	number,
};
const items = [invoice];
const saleDate = new Date();
const aSet = new Set();
const aMap = new Map();
```

## Introducing Traps

Traps are methods defined within the handler object that intercept corresponding operations on the target object.

Traps:

- Just object-level middleware
- Allows you to opt-into taking responsibility
- You can trap operations, not properties

Use cases:

- Validation of Objects
- Notification of property changes
- Auditing
- Often used for reactivity

---

A **handler** is an object that **defines the behavior of the proxy when performing operations on the target object**.

The handler contains methods called **traps**, which intercept operations like property access, assignment, function invocation, and more. These traps allow you to customize and control the behavior of the target object in a flexible and dynamic way.

---

Here are some common traps:

1. **`get(target, property, receiver)`:**

   - Intercepts property access.
   - Example: Accessing `proxy.foo` will call this trap.

2. **`set(target, property, value, receiver)`:**

   - Intercepts property assignment.
   - Example: Setting `proxy.foo = 42` will call this trap.

3. **`has(target, property)`:**

   - Intercepts the `in` operator.
   - Example: Evaluating `'foo' in proxy` will call this trap.

4. **`deleteProperty(target, property)`:**

   - Intercepts the `delete` operator.
   - Example: `delete proxy.foo` will call this trap.

5. **`ownKeys(target)`:**

   - Intercepts operations that list properties (e.g., `Object.getOwnPropertyNames`, `Object.keys`).

6. **`apply(target, thisArg, argumentsList)`:**

   - Intercepts function calls.
   - Example: Calling `proxy(arg1, arg2)` will call this trap.

7. **`construct(target, argumentsList, newTarget)`:**
   - Intercepts object instantiation.
   - Example: Using `new proxy(arg1, arg2)` will call this trap.

---

Example:

```typescript
interface Person {
	name: string;
	age: number;
}

const person: Person = { name: 'John', age: 30 };

const handler: ProxyHandler<Person> = {
	get(target, property, receiver) {
		if (property === 'name') {
			return `Hello, ${target[property as keyof Person]}`;
		}
		return target[property as keyof Person];
	},
	set(target, property, value, receiver) {
		if (property === 'age' && typeof value !== 'number') {
			throw new TypeError('Age must be a number');
		}
		target[property as keyof Person] = value;
		return true;
	},
};

const proxyPerson = new Proxy<Person>(person, handler);

// Usage
console.log(proxyPerson.name); // Output: Hello, John
proxyPerson.age = 35; // Works fine
console.log(proxyPerson.age); // Output: 35
```

## Function Traps

It refers to the `apply` trap, which **intercepts calls to a function**. This allows you to control the behavior of function invocation, including modifying arguments, logging calls, enforcing conditions, or even changing the return value.

The `apply` trap is part of the `ProxyHandler` object and is specifically designed to handle function calls. It is invoked when the proxy is called as a function. The `apply` trap takes three arguments:

1. **target**: The original function being proxied.
2. **thisArg**: The value of `this` provided for the call to the target function.
3. **argumentsList**: An array-like object representing the arguments passed to the function.

```typescript
function sum(a: number, b: number): number {
	return a + b;
}

const handler: ProxyHandler<typeof sum> = {
	apply(target, thisArg, argumentsList) {
		console.log(`Called with arguments: ${argumentsList}`);

		// Modify arguments if needed
		const newArgumentsList = argumentsList.map((arg) => (arg as number) * 2);

		// Call the original function with the modified arguments
		const result = target.apply(thisArg, newArgumentsList);

		console.log(`Result: ${result}`);
		return result;
	},
};

const proxySum = new Proxy(sum, handler);

// Usage
console.log(proxySum(1, 2)); // Output: Called with arguments: 1,2 \n Result: 6 \n 6
```

## Summary

- Proxies are just surrogates for objects
- Traps are just object-level middleware for operations
- You can proxy anything that is an 'object'
