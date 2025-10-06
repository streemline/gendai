(function(){
    // Ініціалізуємо ключ збереження налаштувань у localStorage
    var STORAGE_KEY = 'plugin.custom_menu_config';
    var config = Lampa.Storage.get(STORAGE_KEY, { 
        hide: {
            feed: false,
            people: false,
            catalog: false,
            anime: false,
            torrents: false,
            collections: false,
            kids: false
        },
        addBrowser: false
    });

    // Функція для оновлення налаштувань при зміні через UI
    function saveConfig() {
        Lampa.Storage.set(STORAGE_KEY, config);
    }

    // Основна функція плагіна, викликається після того, як Lampa завантажить інтерфейс
    function initPlugin() {
        // 1) Приховуємо пункти меню за ключами, якщо вони увімкнені в конфігурації
        if(config.hide.feed)       Lampa.Menu.delete('feed');       // «Стрічка»
        if(config.hide.people)     Lampa.Menu.delete('people');     // «Особи»
        if(config.hide.catalog)    Lampa.Menu.delete('catalog');    // «Каталог»
        if(config.hide.anime)      Lampa.Menu.delete('anime');      // «Аніме»
        if(config.hide.torrents)   Lampa.Menu.delete('torrents');   // «Торренти»
        if(config.hide.collections)Lampa.Menu.delete('collections'); // «Коллекции»
        if(config.hide.kids)       Lampa.Menu.delete('kids');       // «Для дітей»

        // 2) Додаємо пункт «Браузер» у меню (якщо увімкнено)
        if(config.addBrowser){
            Lampa.Menu.add({
                name: 'browser',
                title: 'Браузер',
                icon: Lampa.Utils.icon('browser'), // іконка (припустимо існує)
                click: function() {
                    // Відкриваємо URL у системному чи вбудованому браузері
                    Lampa.System.open({
                        url: 'https://www.google.com', // приклад сторінки
                        external: false // вбудований браузер
                    });
                }
            });
        }
    }

    // Реєструємо плагін і його налаштування у системі Лампи
    Lampa.Plugin.add({
        name: 'custom_menu',
        title: 'Налаштування меню',
        version: '1.0',
        description: 'Приховує пункти меню та додає пункт Браузер',
        // Створюємо інтерфейс налаштувань плагіна
        settings: function() {
            // Будуємо форму налаштувань плагіна
            return {
                form: [
                    { 
                        name: 'hide_feed', title: 'Приховати «Стрічка»', type: 'toggle', value: config.hide.feed,
                        onChange: function(v){ config.hide.feed = v; saveConfig(); }
                    },
                    { 
                        name: 'hide_people', title: 'Приховати «Особи»', type: 'toggle', value: config.hide.people,
                        onChange: function(v){ config.hide.people = v; saveConfig(); }
                    },
                    { 
                        name: 'hide_catalog', title: 'Приховати «Каталог»', type: 'toggle', value: config.hide.catalog,
                        onChange: function(v){ config.hide.catalog = v; saveConfig(); }
                    },
                    { 
                        name: 'hide_anime', title: 'Приховати «Аніме»', type: 'toggle', value: config.hide.anime,
                        onChange: function(v){ config.hide.anime = v; saveConfig(); }
                    },
                    { 
                        name: 'hide_torrents', title: 'Приховати «Торренти»', type: 'toggle', value: config.hide.torrents,
                        onChange: function(v){ config.hide.torrents = v; saveConfig(); }
                    },
                    { 
                        name: 'hide_collections', title: 'Приховати «Колекції»', type: 'toggle', value: config.hide.collections,
                        onChange: function(v){ config.hide.collections = v; saveConfig(); }
                    },
                    { 
                        name: 'hide_kids', title: 'Приховати «Для дітей»', type: 'toggle', value: config.hide.kids,
                        onChange: function(v){ config.hide.kids = v; saveConfig(); }
                    },
                    { 
                        name: 'add_browser', title: 'Додати «Браузер»', type: 'toggle', value: config.addBrowser,
                        onChange: function(v){ config.addBrowser = v; saveConfig(); }
                    }
                ]
            };
        },
        // Ініціалізуємо плагін після завантаження меню
        onInit: initPlugin
    });

    // При завантаженні скрипта реєструємо плагін в Lampa
    Lampa.Plugin.register();
})();
