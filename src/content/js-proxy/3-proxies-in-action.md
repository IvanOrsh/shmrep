---
title: 'Proxies in Action'
description: 'More examples on Proxies'
chapterNumber: 3
---

## Proxies on Classes

- You can create a proxy for a class (itself)
- This is for the 'Type'
- Basically just a constructor function
- Key is the `construct` trap
- Useful for returning an instance proxy

```ts
class Order {
	orderId: string;
	orderNumber: number = 0;
	orderDate: Date = new Date();
	dueDate = this.#dueDate(30);
	customerId: string;
	shipping = false;
	notes: string = '';
	terms: string[] = [];
	items = [];

	constructor(orderId: string, customerId: string, terms: string[]) {
		this.orderId = orderId;
		this.customerId = customerId;
		this.terms = terms;
	}

	#dueDate(days: number) {
		const now = new Date();
		now.setDate(now.getDate() + days);
		return now;
	}

	isValid() {
		return this.orderId && this.customerId;
	}
}

const classProxy = new Proxy<typeof Order>(Order, {
	construct(target, args, newTarget) {
		console.log(
			`Target: ${target.name}\nArgs: ${args}\nNew Target: ${newTarget.name}`,
		);

		return new Proxy(Reflect.construct(target, args, newTarget), {
			get(target, property) {
				console.log(`Getting ${String(property)}`);
				return Reflect.get(target, property);
			},
		});
	},
});

const order = new classProxy('1234', '5678', ['terms 1', 'terms 2']);

order.customerId;
```

## Property Definitions

- Can control definition and deletion
- Useful for controlling naming rules
- Also, useful for preventing deletion

The **`defineProperty`** trap in JavaScript's Proxy API intercepts attempts to define a new property or modify an existing property on an object. This trap is invoked when Object.defineProperty or similar methods are used on the proxied object. By using the defineProperty trap, you can customize the behavior of property definitions, enforce validation, or add logging.

DON'T USE `set` TRAP TOGETHER WITH `defineProperty` - if you have `set` trap, `definedProperty` trap will be ignored

```js
const handler = {
	defineProperty(target, property, descriptor) {
		console.log(
			`Defining property ${String(property)} with descriptor:`,
			descriptor,
		);

		// Enforce read-only property constraint
		if (property === 'readOnly' && descriptor.writable) {
			throw new Error('Cannot make readOnly property writable');
		}

		// Enforce type constraint
		if (property === 'age' && typeof descriptor.value !== 'number') {
			throw new TypeError('age must be a number');
		}

		// Define the property on the target object
		return Reflect.defineProperty(target, property, descriptor);
	},
};

const target = {};
const proxy = new Proxy(target, handler);

Object.defineProperty(proxy, 'readOnly', {
	value: 'I am read-only',
	writable: false,
	enumerable: true,
	configurable: true,
}); // Logs: Defining property readOnly with descriptor: { value: 'I am read-only', writable: false, enumerable: true, configurable: true }

console.log(proxy.readOnly); // Output: I am read-only

try {
	Object.defineProperty(proxy, 'readOnly', {
		value: 'I am now writable',
		writable: true,
		enumerable: true,
		configurable: true,
	});
} catch (e) {
	console.error(e.message); // Output: Cannot make readOnly property writable
}

try {
	Object.defineProperty(proxy, 'age', {
		value: 'thirty',
		writable: true,
		enumerable: true,
		configurable: true,
	});
} catch (e) {
	console.error(e.message); // Output: age must be a number
}

Object.defineProperty(proxy, 'age', {
	value: 30,
	writable: true,
	enumerable: true,
	configurable: true,
}); // Logs: Defining property age with descriptor: { value: 30, writable: true, enumerable: true, configurable: true }

console.log(proxy.age);
```

---

The **`deleteProperty`** trap in JavaScript's Proxy API intercepts attempts to delete properties from an object. This trap is invoked when the delete operator is used on a proxied object. By using the deleteProperty trap, you can customize the behavior of property deletions, enforce validation, or add logging

```js
const handler = {
	deleteProperty(target, property) {
		console.log(`Deleting property ${String(property)}`);

		// Perform custom logic or validation here
		if (property in target && typeof target[property] === 'string') {
			console.log(`Cannot delete string properties.`);
			return false;
		}

		// Delete the property from the target object
		return Reflect.deleteProperty(target, property);
	},
};

const target = {
	name: 'Alice',
	age: 30,
};

const proxy = new Proxy(target, handler);

delete proxy.age; // Logs: Deleting property age
console.log(proxy.age); // Output: undefined

delete proxy.name; // Logs: Deleting property name \n Cannot delete string properties.
console.log(proxy.name); //
```

## Trapping Extensibility (`isExtensible` and `preventExtensions`)

- Useful for controlling change
- Can protect extending object contracts
- Less common use of proxies

```ts
const classProxy = new Proxy<typeof Order>(Order, {
	construct(target, args, newTarget) {
		console.log(
			`Target: ${target.name}\nArgs: ${args}\nNew Target: ${newTarget.name}`,
		);

		return new Proxy(Reflect.construct(target, args, newTarget), {
			get(target, property) {
				console.log(`Getting ${String(property)}`);
				return Reflect.get(target, property);
			},

			isExtensible(target) {
				console.log('Extending');
				return Object.isExtensible(target);
			},

			preventExtensions(target) {
				console.log('Locking down object');
				return Object.preventExtensions(target);
			},
		});
	},
});

const order = new classProxy('1234', '5678', ['terms 1', 'terms 2']);

order.customerId;

Object.preventExtensions(order);

if (Object.isExtensible(order)) {
	console.log('Extensible');
}
```

## Example: Function Throttling

- Common scenario for using proxy
- Can protect execution
- Useful to prevent hammering an API

```ts
interface ThrottledFunction extends Function {
	_throttleTime?: number;
	_lastCallTime?: number;
}

const throttleHandler = {
	async apply(target: ThrottledFunction, thisArg: any, args: any[]) {
		const now = Date.now();
		const throttleTime = target._throttleTime || 1000;

		if (!target._lastCallTime || now - target._lastCallTime >= throttleTime) {
			target._lastCallTime = now;
			return await Reflect.apply(target, thisArg, args);
		} else {
			console.log(
				`Throttled for ${throttleTime - (now - target._lastCallTime)}ms`,
			);
			return Promise.resolve();
		}
	},
};

function throttle<T extends ThrottledFunction>(
	fn: T,
	throttleTime: number = 1000,
) {
	fn._throttleTime = throttleTime;
	return new Proxy(fn, throttleHandler) as T;
}

async function getCatFacts() {
	try {
		const res = await fetch('https://catfact.ninja/fact');
		const data = await res.json();
		return data.fact;
	} catch (err) {
		console.log(err);
	}
}

const throttledGetCatFacts = throttle(getCatFacts, 2000);
console.log(await throttledGetCatFacts());
console.log(await throttledGetCatFacts());

setTimeout(async () => {
	console.log(await throttledGetCatFacts());
}, 3000);
```

## What are Revocable Proxies?

- Supports short term proxies
- Reduces footprint once revoked

Revocable Proxies in JavaScript are a special type of Proxy that can be dynamically "revoked" or disabled, making any further operations on the proxy result in an error. This can be useful in scenarios where you need to temporarily grant and then later revoke access to an object, such as for security purposes or to manage resource lifetimes more precisely.

Syntax:

```js
const { proxy, revoke } = Proxy.revocable(target, handler);
```

```ts
const someObj = {
	name: 'Shawn',
	city: 'Atlanta',
};

const handler: ProxyHandler<typeof someObj> = {
	get(target, property) {
		if (property === 'name') {
			return Reflect.get(target, property).toUpperCase();
		}

		return Reflect.get(target, property);
	},
};

const { proxy, revoke } = Proxy.revocable<typeof someObj>(someObj, handler);

console.log(`${proxy.name} from ${proxy.city}`);
revoke();
console.log(`${proxy.name} from ${proxy.city}`); // TypeError: Cannot perform `get` on a proxy that has been revoked
```

## Limitations of Proxies:

1. **Performance Overhead**: Proxies introduce an additional layer of abstraction between code and data access. While modern JavaScript engines optimize Proxy operations, there can still be a performance overhead compared to direct property access on plain objects.

2. **Compatibility**: Proxies are relatively new additions to JavaScript (introduced in ES6), and older browsers or environments may not support them fully or at all. This limits their use in certain contexts where compatibility with older systems is crucial.

3. **Non-extensible Objects**: Proxies cannot directly proxy operations on non-extensible objects (objects created with `Object.preventExtensions`, `Object.seal`, or `Object.freeze`). This is because Proxy operations generally require an extensible target object.

4. **No Inherited Properties**: Proxies only intercept operations on the object they are applied to directly. They do not automatically intercept operations on inherited properties or prototype chain accesses. This can lead to unexpected behavior if not carefully managed.

5. **Limited Trapping of Built-in Methods**: Certain built-in methods and operations (like `Object.create`, `Object.defineProperty`, `Object.getOwnPropertyDescriptor`, `Object.keys`, etc.) bypass Proxy traps, making it impossible to intercept or modify their behavior with Proxies.

6. **Security Considerations**: Proxies can be used to enhance security by controlling access to objects, but poorly implemented Proxies could inadvertently expose or alter sensitive data or behavior.

7. **Complexity and Debugging**: Proxies can introduce complexity to codebases, especially when multiple proxies are used or when the trapping logic becomes intricate. Debugging Proxy-related issues can also be challenging due to the indirect nature of their operations.

8. **Proxying Certain Built-in Objects**: Proxies do not work uniformly across all built-in objects in JavaScript. For example, it's challenging or impossible to proxy certain fundamental objects like `Array`, `Date`, `Map`, `Set`, etc., due to their internal implementations and optimizations.

9. **Performance Concerns with Arrays**: Proxies applied to arrays can impact performance, especially for operations like iteration (`for...of`), `length` property modification, or array method calls. This is due to the nature of how arrays are optimized in JavaScript engines.

10. **Memory Consumption**: Depending on the implementation, creating and using multiple proxies or proxies with complex traps can potentially lead to increased memory consumption, which can impact application performance and scalability.
