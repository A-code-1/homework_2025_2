'use strict';

/**
 * загружает JSON с нескольких URL и объединяет их в один объект.
 * если ключ встречается в нескольких объектах, значения собираются в массив уникальных значений.
 * если ключ встречается только один раз, значение будет массивом.
 * 
 * @param {Array<string>} urls - массив URL-адресов 
 * @returns {Promise<Object>} - промис, который резолвится в объединенный объект
 */
const fetchAndMergeData = async (urls) => {
    if (!Array.isArray(urls)) {
        throw new TypeError("Аргумент urls должен быть массивом");
    }

    if (!urls.every(url => typeof url === "string")) {
        throw new TypeError("Каждый элемент массива urls должен быть строкой");
    }

    // загружаем URL-адреса параллельно
        const results = await Promise.all(
            urls.map(url =>
                fetch(url)
                    .then(res => (res.ok ? res.json() : {}))
                    .catch(() => ({})) //при ошибке пустой объект
            )
        );
        //тут собираем все объекты
        const merged = results.reduce((acc, obj) => {
            Object.entries(obj).forEach(([key, value]) => {
                if (!acc[key]) {
                    acc[key] = new Set();
                }
                acc[key].add(value);
            });
            return acc;
        }, {});
    
        // преобразуем Set обратно в массивы
        const array = Object.fromEntries(
            Object.entries(merged).map(([key, valueSet]) => [key, [...valueSet]])
        );
    
        return array;
}
