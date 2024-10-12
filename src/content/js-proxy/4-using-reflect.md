---
title: 'Using Reflect'
description: 'Use Reflect API to simplify some Proxy handlers'
chapterNumber: 4
---

## What is `Reflect`?

- Static Object
- API for performing proxy operations
- Does not require proxy
- Mirrors the Handler

The `Reflect` object in JavaScript is a built-in object that provides methods for interceptable JavaScript operations. It serves as a collection of utility functions that mirror corresponding operations on objects, but in a way that allows them to be applied more generically and with less implicit behavior than direct property access or invocation.

## Overview of Reflect API

The Reflect API includes static methods that correspond to various fundamental operations that can be performed on objects. These methods are designed to be used with Proxy objects, where they serve as fallbacks or default behaviors that a Proxy can delegate to. Here are some key methods provided by the Reflect API:

1. **Property Access Methods**:

   - `Reflect.get(target, propertyKey [, receiver])`: Retrieves the value of a property from a target object.
   - `Reflect.set(target, propertyKey, value [, receiver])`: Sets the value of a property on a target object.

2. **Property Definition Methods**:

   - `Reflect.defineProperty(target, propertyKey, attributes)`: Defines a new property directly on a target object or modifies an existing property.
   - `Reflect.deleteProperty(target, propertyKey)`: Deletes a property from a target object.

3. **Object Prototype Methods**:

   - `Reflect.getPrototypeOf(target)`: Retrieves the prototype of a target object.
   - `Reflect.setPrototypeOf(target, prototype)`: Sets the prototype of a target object.

4. **Function Invocation Methods**:

   - `Reflect.apply(target, thisArgument, argumentsList)`: Calls a target function with a specified `this` context and arguments.
   - `Reflect.construct(target, argumentsList [, newTarget])`: Creates a new instance of a target constructor function with the given arguments.

5. **Others**:
   - `Reflect.has(target, propertyKey)`: Checks if a property exists on a target object.
   - `Reflect.ownKeys(target)`: Returns an array of the target object's own property keys.

## When to Use Reflect API

1. **Proxy Handlers**:

   - The Reflect API is commonly used in conjunction with Proxies (`Proxy` object) to define default behavior or fallbacks in Proxy traps (`get`, `set`, etc.).
   - Using Reflect methods inside Proxy traps provides a consistent and predictable way to handle fundamental operations on objects.

2. **Metaprogramming**:

   - Reflect methods are useful in metaprogramming scenarios where you need to programmatically interact with object properties or modify object behavior based on certain conditions.
   - They provide a more structured and less implicit approach compared to directly manipulating objects or invoking methods.

3. **Default Behavior**:

   - Reflect methods serve as default implementations for common operations like property access, setting values, function invocation, etc.
   - They ensure that Proxy traps maintain expected behavior even when specific traps are not explicitly defined.

4. **Consistency and Readability**:
   - Using Reflect methods can improve code readability and maintainability, especially when working with complex object manipulations or when multiple developers are collaborating on a codebase.

## Using `Reflect` in a Proxy

```js
const handler = {
  get() { ... },
  set() { ... },
  apply() { ... },
  has() { .. },
  defineProperty() { ... },
  deleteProperty() { ... },
  construct() { ... },
  ...
};

Reflect.get( ... );
Reflect.set( ... );
Reflect.apply( ... );
Reflect.has( ... );
Reflect.defineProperty( ... );
Reflect.deleteProperty( ... );
Reflect.construct( ... );
...
```

```js
const order = {
	orderId: 1,
	orderNumber: '1234',
	dueDate: new Date(),
	customerId: 1,
	shipping: 'UPS',
	notes: '',
};

const theOrder =
	new Proxy() <
	typeof order >
	(order,
	{
		get(target, property) {
			const result = Reflect.get(target, property);
			console.log(`Getting ${String(property)}: ${result}`);
			return result;
		},

		set(target, property, value) {
			console.log(`Setting ${String(property)}: ${value}`);
			return Reflect.set(target, property, value);
		},

		defineProperty(target, property, descriptor) {
			console.log(
				`Defining property ${String(property)} with descriptor:`,
				descriptor,
			);
			return Reflect.defineProperty(target, property, descriptor);
		},

		deleteProperty(target, property) {
			console.log(`Deleting ${String(property)}`);
			return Reflect.deleteProperty(target, property);
		},
	});

Reflect.get(theOrder, 'orderNumber');
```

## Summary

- Reflect object can simplify some Proxy handlers
- While Reflect can be used outside a Proxy, it's very rare
- The more your Proxy does, the slower it will run
