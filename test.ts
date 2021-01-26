export const deeplyAssertObjects = (objA: any, objB: any): object => {
	const entries = [...Object.entries(objA), ...Object.entries(objB)];
	const primitiveEntries = entries.filter(([_, value]) => typeof value !== 'object');
	const objectEntrieKeys = entries
		.filter(([_, value]) => typeof value === 'object')
		.map((key) => key);

	const assertedObject = Object.fromEntries(primitiveEntries);

	for (const [key] of objectEntrieKeys) {
		if (objA[key] && objB[key]) {
			if (objA[key] instanceof Map) {
				const assertedMapObjects = deeplyAssertObjects(
					Object.fromEntries(objA[key]),
					Object.fromEntries(objB[key]),
				);
				const assertedMap = new Map(Object.entries(assertedMapObjects));

				assertedObject[key] = assertedMap;
			} else {
				const assertedobjects = deeplyAssertObjects(objA[key], objB[key]);

				assertedObject[key] = assertedobjects;
			}
		} else {
			assertedObject[key] = objA[key] || objB[key];
		}
	}

	// for (const key of object.keys(obja)) {
	// 	if (obja.hasownproperty(key)) {
	// 		if (typeof obja[key] !== 'object') {
	// 			assertedobject[key] = objb.hasownproperty(key) ? objb[key] : obja[key];
	// 		} else {
	// 			if (obja[key] instanceof map) {
	// 				const assertedmapobject = deeplyassertobjects(
	// 					object.fromentries(obja[key]),
	// 					object.fromentries(objb[key]),
	// 				);
	// 				const assertedmap = new map(object.entries(assertedmapobject));

	// 				assertedobject[key] = assertedmap;
	// 			} else {
	// 				const assertedvalue = deeplyassertobjects(obja[key], objb[key]);

	// 				assertedobject[key] = assertedvalue;
	// 			}
	// 		}
	// 	}
	// }

	return assertedObject;
};
console.log(deeplyAssertObjects({ a: (new Map([["b", 1]])) }, { a: (new Map([["c", 2]])) }));

