# API Documentation

This document describes the public APIs available in this project.

## Main Module

**Import:** `const main = require('./src/main');`

The main module provides core application functions.

### `greet(name)`

Greets a user by name.

**Parameters:**
- `name` (string) - The name to greet

**Returns:** `string` - The greeting message

**Throws:** `Error` - If name is not a non-empty string

**Example:**
```javascript
const { greet } = require('./src/main');

greet('Alice');  // Returns: "Hello, Alice!"
greet('World');  // Returns: "Hello, World!"

// Error cases
greet('');       // Throws: Error('Name must be a non-empty string')
greet(123);      // Throws: Error('Name must be a non-empty string')
```

---

### `add(a, b)`

Adds two numbers together.

**Parameters:**
- `a` (number) - First number
- `b` (number) - Second number

**Returns:** `number` - The sum of a and b

**Throws:** `Error` - If either argument is not a number

**Example:**
```javascript
const { add } = require('./src/main');

add(2, 3);     // Returns: 5
add(-1, 1);    // Returns: 0
add(0.1, 0.2); // Returns: 0.30000000000000004

// Error cases
add('2', 3);   // Throws: Error('Both arguments must be numbers')
```

---

### `getVersion()`

Gets the application version.

**Parameters:** None

**Returns:** `string` - The version string (currently "1.0.0")

**Example:**
```javascript
const { getVersion } = require('./src/main');

getVersion();  // Returns: "1.0.0"
```

---

## Utilities Module

**Import:** `const utils = require('./src/utils');`

The utilities module provides helper functions for string and number manipulation.

### String Helpers

#### `capitalize(str)`

Capitalizes the first letter of a string.

**Parameters:**
- `str` (string) - The string to capitalize

**Returns:** `string` - The capitalized string

**Throws:** `Error` - If input is not a string

**Example:**
```javascript
const { capitalize } = require('./src/utils');

capitalize('hello');  // Returns: "Hello"
capitalize('WORLD');  // Returns: "WORLD"
capitalize('');       // Returns: ""

// Error cases
capitalize(123);      // Throws: Error('Input must be a string')
```

---

#### `reverse(str)`

Reverses a string.

**Parameters:**
- `str` (string) - The string to reverse

**Returns:** `string` - The reversed string

**Throws:** `Error` - If input is not a string

**Example:**
```javascript
const { reverse } = require('./src/utils');

reverse('hello');  // Returns: "olleh"
reverse('12345');  // Returns: "54321"
reverse('');       // Returns: ""

// Error cases
reverse(123);      // Throws: Error('Input must be a string')
```

---

#### `truncate(str, maxLength)`

Truncates a string to a specified length, adding ellipsis if needed.

**Parameters:**
- `str` (string) - The string to truncate
- `maxLength` (number) - Maximum length

**Returns:** `string` - The truncated string with "..." appended if truncation occurred

**Throws:** `Error` - If str is not a string or maxLength is not a positive number

**Example:**
```javascript
const { truncate } = require('./src/utils');

truncate('Hello World', 5);   // Returns: "Hello..."
truncate('Hi', 10);           // Returns: "Hi"
truncate('Testing', 7);       // Returns: "Testing"

// Error cases
truncate(123, 5);             // Throws: Error('Input must be a string')
truncate('hello', -1);        // Throws: Error('maxLength must be a positive number')
```

---

### Number Helpers

#### `clamp(num, min, max)`

Clamps a number between min and max values.

**Parameters:**
- `num` (number) - The number to clamp
- `min` (number) - Minimum value
- `max` (number) - Maximum value

**Returns:** `number` - The clamped number

**Throws:** `Error` - If any argument is not a number

**Example:**
```javascript
const { clamp } = require('./src/utils');

clamp(5, 0, 10);    // Returns: 5
clamp(-5, 0, 10);   // Returns: 0
clamp(15, 0, 10);   // Returns: 10

// Error cases
clamp('5', 0, 10);  // Throws: Error('All arguments must be numbers')
```

---

#### `isEven(num)`

Checks if a number is even.

**Parameters:**
- `num` (number) - The number to check

**Returns:** `boolean` - True if even, false otherwise

**Throws:** `Error` - If input is not a number

**Example:**
```javascript
const { isEven } = require('./src/utils');

isEven(4);    // Returns: true
isEven(7);    // Returns: false
isEven(0);    // Returns: true
isEven(-2);   // Returns: true

// Error cases
isEven('4');  // Throws: Error('Input must be a number')
```

---

#### `roundTo(num, decimals)`

Rounds a number to a specified number of decimal places.

**Parameters:**
- `num` (number) - The number to round
- `decimals` (number) - Number of decimal places

**Returns:** `number` - The rounded number

**Throws:** `Error` - If either argument is not a number

**Example:**
```javascript
const { roundTo } = require('./src/utils');

roundTo(3.14159, 2);  // Returns: 3.14
roundTo(3.14159, 4);  // Returns: 3.1416
roundTo(10, 2);       // Returns: 10

// Error cases
roundTo('3.14', 2);   // Throws: Error('Both arguments must be numbers')
```
