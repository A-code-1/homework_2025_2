'use strict';


/**
 * загружает JSON с нескольких URL и объединяет их в один объект.
 * если ключ встречается в нескольких объектах, значения собираются в массив уникальных значений.
 * если ключ встречается только один раз, значение будет массивом.
 * 
 * @param {Array<string>} urls - массив URL-адресов 
 * @returns {Promise<Object>} - промис, который резолвится в объединенный объект
 */
async function fetchAndMergeData(urls) {
    // загружаем URL-адреса параллельно
        const results = await Promise.all(
            urls.map(url =>
                fetch(url)
                    .then(res => (res.ok ? res.json() : {}))
                    .catch(() => ({})) //при ошибке пустой объект
            )
        );
        //тут собираем все объекты
        const merged = {};

        for (const obj of results) {
            for (const [key, value] of Object.entries(obj)) {
                if (!merged[key]) {
                    merged[key] = new Set(); // для уникальных значений
                }
                merged[key].add(value);
            }
        }
    
        // преобразуем Set обратно в массивы
        for (const key in merged) {
            merged[key] = [...merged[key]]; //сохраняется порядок добавления
        }
    
        return merged;
}