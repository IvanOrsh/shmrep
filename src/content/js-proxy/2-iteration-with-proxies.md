---
title: 'Iteration with Proxies'
description: 'Using Proxies with Arrays, Objects, Sets...'
chapterNumber: 2
---

## Proxy with Arrays

Arrays:

- are still just objects
- array proxies might require multiple traps
- array proxies doesn't wrap items

```typescript
type Person = {
	name: string;
	age: number;
};

const people: Person[] = [
	{ name: 'John', age: 30 },
	{ name: 'Jane', age: 25 },
	{ name: 'Bob', age: 40 },
	{ name: 'Alice', age: 35 },
	{ name: 'Charlie', age: 20 },
];

const proxyPeople = new Proxy<Person[]>(people, {
	get(target, key) {
		console.log(`Key: ${key.toString()}`);

		if (key === 'pop') {
			throw new Error('Method not allowed');
		}

		return Reflect.get(target, key);
	},

	set(target, property, value: any, receiver) {
		if (typeof property === 'string' && !isNaN(Number(property))) {
			const index = Number(property);

			if (index < 0 || index >= target.length) {
				throw new RangeError(`Index ${index} is out of bounds`);
			}

			if (typeof value !== 'object' || value === null) {
				throw new TypeError('Value must be an object');
			}

			console.log(`Setting value ${value} at index ${index}`);
		}

		return Reflect.set(target, property, value, receiver);
	},
});

const [first] = proxyPeople;
console.log(first);

proxyPeople[1] = { name: 'New Name', age: 30 };

proxyPeople.forEach((person) => console.warn(person.name));

proxyPeople.pop();
```

## Object Keys: `ownKeys` trap

- Iterating through keys can be proxied
- Requires trapping `ownKeys`

Long story short, we need a combination of traps, like `ownKeys`, `get`, and `set`:

```ts
type Customer = {
	firstname: string;
	lastname: string;
	phone: string;
	companyname: string;
	_id: string;
};

type CustomerKeys = keyof Customer;

const customer: Customer = {
	firstname: 'John',
	lastname: 'Doe',
	phone: '555-555-5555',
	companyname: 'Acme Corp',
	_id: '12345',
};

const proxyCust = new Proxy<Customer>(customer, {
	ownKeys(target) {
		return Object.keys(target).filter((k) => k[0] !== '_');
	},

	get(target, property) {
		if (property === '_id') {
			throw new Error(`Cannot access _id: ${property}`);
		}

		return target[property as CustomerKeys];
	},

	set(target, property, value) {
		if (property === '_id') {
			return false;
		}

		return Reflect.set(target, property, value);
	},

	has(target, property) {
		if (property === '_id') {
			return false;
		}

		return property in target;
	},
});

for (const key in proxyCust) {
	console.log(proxyCust[key as CustomerKeys]);
}

console.log('_id' in proxyCust);
```

## Nested Proxies

- Proxies only handle direct properties
- But you can return proxies too

```ts
const proxyCache = new WeakMap();

function createHandler(): ProxyHandler<any> {
	return {
		get(target, property, receiver) {
			const value = Reflect.get(target, property, receiver);
			if (typeof value === 'object' && value !== null) {
				if (!proxyCache.has(value)) {
					proxyCache.set(value, new Proxy(value, createHandler()));
				}
				return proxyCache.get(value);
			}
			return value;
		},
		set(target, property, value, receiver) {
			console.log(`Setting value ${value} at property ${String(property)}`);
			return Reflect.set(target, property, value, receiver);
		},
	};
}

function createNestedProxy<T extends object>(obj: T): T {
	if (!proxyCache.has(obj)) {
		proxyCache.set(obj, new Proxy(obj, createHandler()));
	}
	return proxyCache.get(obj);
}

// Usage example
const nestedObject: any = {
	a: {
		b: {
			c: 42,
		},
	},
	x: [1, 2, 3],
};
nestedObject.self = nestedObject; // Cyclic reference

const proxyNestedObject = createNestedProxy(nestedObject);

proxyNestedObject.a.b.c = 100; // Logs: Setting value 100 at property c
console.log(proxyNestedObject.a.b.c); // Output: 100

proxyNestedObject.x[1] = 200; // Logs: Setting value 200 at property 1
console.log(proxyNestedObject.x[1]); // Output: 200

console.log(proxyNestedObject.self.a.b.c); // Output: 100
```

## Proxy with Sets

For sets, iteration can be controlled using the `get` trap to intercept methods like `forEach`, `values`, and `entries`.

```javascript
const handler = {
	get(target, property, receiver) {
		console.log(`Getting property ${property}`);
		const origMethod = target[property];
		if (typeof origMethod === 'function') {
			return function (...args) {
				console.log(`Calling method ${property} with arguments ${args}`);
				return origMethod.apply(target, args);
			};
		}
		return Reflect.get(target, property, receiver);
	},
};

const set = new Set([1, 2, 3, 4, 5]);
const proxySet = new Proxy(set, handler);

// Usage examples
for (const item of proxySet) {
	console.log(item); // Output: Getting property values \n Calling method values with arguments  \n 1 \n 2 \n 3 \n 4 \n 5
}

proxySet.forEach((value) => console.log(value)); // Output: Getting property forEach \n Calling method forEach with arguments <callback>
```

## Summary

1. The mechanism of an array proxy (set proxy) is the same as object proxies

2. **`get` Trap**:

   - Intercepts property access on the target object. In the case of collections, this can include array indices or methods like `values`, `entries`, `forEach`, etc.
   - For functions (methods of the collection), it intercepts the call and allows you to log or modify the behavior.

3. **`ownKeys` Trap**:

   - Intercepts operations that list property keys, such as `Object.keys`, `for...in` loops, or direct iteration with `for...of`.

4. **`has`** Trap:

   - Intercepts the `in` operator.

5. **Iteration Handling**:

   - For arrays, iteration internally uses the `ownKeys` trap to determine the list of indices to iterate over.
   - For sets, iteration uses the `values` method, which can be intercepted by the `get` trap.

6. You can wrap members by returning nested proxies.
