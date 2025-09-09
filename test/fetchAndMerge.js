/* eslint-disable require-jsdoc */

'use strict';

QUnit.module("Тестируем функцию fetchAndMerge", function() {
    QUnit.test("Возвращает объект при полученных данных", async function(assert) {
        const urls = [
            'https://vk.example.com/vkid',
            'https://mailru.example.com/mailid',
        ];
        const expected = {
            "age": [25, 22],
            "id": [1, 2],
            "name": ["Олег", "Мария"],
            "surname": ["Петров", "Иванова"],
            "status": ["Дуров, верни стену!"],
        };
        
        window.fetch = (url) => {
            const data = {
                'https://vk.example.com/vkid': { "id": 1, "name": "Олег", "surname": "Петров", "age": 25, "status": "Дуров, верни стену!" },
                'https://mailru.example.com/mailid': { "id": 2, "name": "Мария", "surname": "Иванова", "age": 22 },
            };

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data[url]),
            });
        };

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, expected, "Должно правильно объединять данные с разных URL");
    });

    QUnit.test("Работает правильно при ошибках fetch", async function(assert) {
        const urls = [
            'https://vk.example.com/mailru',
            'https://vk.example.com/byte'
        ];

        window.fetch = () => Promise.reject(new Error("Network error"));

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, {}, "Должно возвращать пустой объект при ошибке fetch");
    });
});

QUnit.module("Дополнительные тесты fetchAndMerge", function() {
    QUnit.test("Объединяет объекты с одинаковыми значениями", async function(assert) {
        const urls = [
            'https://example.com/1',
            'https://example.com/2',
        ];
        
        window.fetch = (url) => {
            const data = {
                'https://example.com/1': { x: 1, y: 2 },
                'https://example.com/2': { x: 1, z: 3 },
            };
            return Promise.resolve({ ok: true, json: () => Promise.resolve(data[url]) });
        };

        const expected = { 
            x: [1], // массив
            y: [2],
            z: [3]
        };

        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, expected, "Все значения — массивы, одинаковые значения не дублируются");
    });

    QUnit.test("Объединяет объекты с разными значениями одного ключа", async function(assert) {
        const urls = [
            'https://example.com/a',
            'https://example.com/b',
        ];

        window.fetch = (url) => {
            const data = {
                'https://example.com/a': { key: 'val1' },
                'https://example.com/b': { key: 'val2' },
            };
            return Promise.resolve({ ok: true, json: () => Promise.resolve(data[url]) });
        };

        const expected = { key: ['val1', 'val2'] };
        const result = await fetchAndMergeData(urls);
        assert.deepEqual(result, expected, "Собираются разные значения в массив");
    });
});

QUnit.module("Тесты на неправильные данные", function() {
    QUnit.test("Ошибка, если аргумент не массив", async function(assert) {
        try {
            await fetchAndMergeData("не массив");
            assert.ok(false, "Должна была быть ошибка");
        } catch (e) {
            assert.ok(e instanceof TypeError, "Ошибка типа TypeError");
            assert.equal(e.message, "Аргумент urls должен быть массивом");
        }
    });
    
    QUnit.test("Ошибка, если элементы массива не строки", async function(assert) {
        try {
            await fetchAndMergeData([123, true]);
            assert.ok(false, "Должна была быть ошибка");
        } catch (e) {
            assert.ok(e instanceof TypeError, "Ошибка типа TypeError");
            assert.equal(e.message, "Каждый элемент массива urls должен быть строкой");
        }
    });
});
