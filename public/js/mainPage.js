var myData = [
    {
        title: 'Заметка №1',
        rank: '1',
    },
    {
        title: 'Заметка №2',
        rank: '2',
    },
    {
        title: 'Заметка №3',
        rank: '3',
    }
]

// ToDo: Сделай чтото с этим..
function getData() {
    webix.ajax().get('api/env/getData').then(function(data){
        data = data.text();
        data = Number(data);

        $$("NoteTextArea").define("attributes", { maxlength: data });
        $$("NoteTextArea").refresh();
    });
};

// ToDo: Сделай чтото с этим..
function setData(noteMaxLength) {
    webix.ajax().get('api/env/setData/' + noteMaxLength).then(function(data){
        getData();
    });
};

// *** Функции по обращению к серверу ***

function loadNoteList() {
    $$("NotesList").clearAll(); // Заменить на аргумент в функции load (Который true)
    $$("NotesList").load(function() {
        return webix.ajax().get('api/note/getTitles');
    });
    disableTextarea();  // И почему оно блин тут?
                        //А может оно нужно?
}

function redactNoteContent(noteName, newText) {
    var reqResult = webix.ajax().get('api/note/redactContent/' + noteName + '/' + newText); // Лучше сделать так, или .then? [?] -

    if(reqResult) {
        webix.message('Текст заметки изменен');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }

}

function showNoteContent(noteName) {

    $$("NoteTextArea").setValue(' ');
    $$("NoteTextArea").disable();
    $$("NoteTextArea").showProgress({
        type: "icon",
        delay: 500,
        hide: true
    });

    webix.ajax().get('api/note/showContent/' + noteName).then(function(data) {
        data = data.text();

        $$("NoteTextArea").setValue(data);
        $$("NoteTextArea").enable();
        $$("NoteTextArea").focus();
    });
}

function renameNote(noteName, newNoteName, noteId) {
    var reqResult = webix.ajax().get('api/note/rename/' + noteName + '/' + newNoteName);

    if(reqResult) {
        var renameNote = $$("NotesList").getItem(noteId);
        renameNote.title = newNoteName;
        $$("NotesList").updateItem(noteId, renameNote);

        webix.message('Заметка переименована');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }
}

function createNote(newNoteName) {
    var reqResult = webix.ajax().get('api/note/create/' + newNoteName);

    if(reqResult) {
        let newNote = {
            rank: "|",
            title: newNoteName
        };
        $$("NotesList").add(newNote);
        webix.message('Заметка создана');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }
}

function deleteNote(noteName, noteId) {
    var reqResult = webix.ajax().get('api/note/delete/' + noteName);

    if(reqResult) {
        $$("NotesList").remove(noteId);
        webix.message('Заметка удалена');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }
}

function disableTextarea() { // ToDo: Разобраться почему всегда == 0. А также посмотреть про overlay Box
    var notesCount = $$("NotesList").count();

    $$("NoteTextArea").disable();
    if(notesCount == 0) {
        $$("NoteTextArea").setValue('Создайте заметку');
    } else {
        $$("NoteTextArea").setValue('Выберите заметку');
    }
}





webix.ready(function(){
    webix.ui({
        rows: [
            {
                cols: [
                    {
                        // Меню слева
                        width: 300,
                        type: 'clean',

                        rows: [
                            {
                                view:"toolbar",
                                id:"toolbar", // ToDo: Изменить название
                                height: 40,
                                type: 'clean',

                                cols: [
                                    {
                                        view: 'icon',
                                        icon: 'wxi-dots',
                                        click: function(){
                                            if( $$("menu").config.hidden) {
                                                $$("menu").show();
                                            } else {
                                                $$("menu").hide();
                                            }
                                        }
                                    },
                                    {
                                        view:'search',
                                        id: 'NotesList_input',

                                        placeholder: 'Найти...',
                                    }
                                ]
                            },
                            {
                                view: 'list',
                                id: 'NotesList',
                                data: ' ', // НЕ УДАЛЯТЬ! Иначе не произайдет прогрузки

                                select: true,
                                scroll: 'auto',
                                template:"#rank#. #title#",

                                onContext:{}, // Позволяет использовать свое контекстное меню
                            },

                        ]
                    },
                    {
                        // Текстовое поле справа
                        rows: [
                            {    
                                cols: [
                                    {
                                        
                                    },
                                    {
                                        // Загрузить данные
                                        view: 'icon',
                                        icon: 'wxi-file',
                                        click: function() {
                                            var itemId = $$("NotesList").getSelectedItem().title; // ToDo: Изменить (выглядит ужасно)
                                            var newText = $$("NoteTextArea").getValue();
                                            redactNoteContent(itemId, newText);
                                        },
                                    }
                                ]
                                
                            },
                            {
                                view: 'textarea', // ToDo: Убрать блин эти бортики! БЕСЯТ!!
                                id: 'NoteTextArea',
                                placeholder: 'Напишите что-то здесь',

                                attributes: {
                                    maxlength: 1,
                                },
                                
                                css: {
                                    'border': 'none !important',
                                    'outline': 'none !important',
                                }
                            },                        
                        ]


                        
                    }
                ]
            }
        ]
    });



    // *** Дополнительные элементы интерфейса ***

    // Контекстное меню для списка заметок
    webix.ui({ 
        view:"contextmenu",
        id:"cmenu",
        data: [
            "Переименовать",
            "Удалить",
            { $template:"Separator" },
            "Логи",
        ],

        on:{
            onItemClick: function(id) {
                var context = this.getContext(); // Зачем так много переменных? ИСПРАВИТЪ!!! [?] -
                var list = context.obj;
                var itemId = context.id;
                var itemTitle = list.getItem(itemId).title;

                switch (id) {
                    case "Переименовать":
                        webix.prompt({
                            title:"Переименование заметки",
                            text:"Введите новое название заметки",
                            ok:"Переименовать",
                            cancel:"Отменить",
                            input:{
                              required:true,
                              placeholder:"Ваше название",
                              value: itemTitle
                            },
                            width: 350,
                        }).then(function(result){
                            renameNote(itemTitle, result, itemId);
                        });
                        break;
                    case "Удалить":

                        webix.confirm({
                            title:"Подтвердите действие",
                            ok:"Да", 
                            cancel:"Нет",
                            text:'Вы уверены что хотите удалить "' + itemTitle + '"?',
                        }).then(function(result){
                            deleteNote(itemTitle, itemId);
                        });
                        break;
                    case "Логи":
                        webix.message("**Сделать вывод логов**");
                        break;
                };
                
                //webix.message("List item: <i>"+itemId+"</i> <br/>Context menu item: <i>"+this.getItem(id).value+"</i>");
            }
        }
    });

    $$("cmenu").attachTo($$("NotesList"));

    // Боковое меню со всеми кнопками
    webix.ui({ // ToDo: Сделать это.. Рабочим?
        view: "sidemenu",
        id: "menu",
        width: 200,
        position: "left",
        body:{
            view: "list",
            id: "Sidemenu_list",
            borderless: true,
            scroll: false,
            template: "<span class='webix_icon mdi mdi-#icon#'></span> #value#",
            data: [
                {id: 1, value: "Новая заметка", icon: "plus-circle"},
                {id: 2, value: "Обновить список", icon: "reload"},
                {id: 3, value: "Настройки", icon: "cog"},
            ],
            select: true,
            type: {
                height: 40
            },

            on: {
                onItemClick: function(id) {
                    switch (id) {
                        case '1':
                            webix.prompt({
                                title:"Создание заметки",
                                text:"Введите название новой заметки",
                                ok:"Создать",
                                cancel:"Отменить",
                                input:{
                                required:true,
                                placeholder:"Ваше название",
                                },
                                width: 350,
                            }).then(function(result) {
                                createNote(result);
                            });
                            break;

                        case '2':
                            loadNoteList();
                            break;

                        case '3':
                            webix.prompt({
                                title:"Изменение длины заметки",
                                text:"Введите новое значение длины заметки",
                                ok:"Изменить",
                                cancel:"Отменить",
                                input:{
                                required:true,
                                placeholder:"Ваша длина",
                                },
                                width: 350,
                            }).then(function(result) {
                                setData(result);
                            });
                            break;
                    };

                    $$("menu").hide();
                }
            }
        }
    });



    // *** События ***

    // Фильтрация списка заметок
    $$("NotesList_input").attachEvent("onTimedKeyPress", function() {
        var value = this.getValue().toLowerCase();
        $$("NotesList").filter(function(obj){
          return obj.title.toLowerCase().indexOf(value) !== -1;
        })
    });

    // Загрузка текста из заметки
    $$("NotesList").attachEvent("onSelectChange", function() {

        if($$("NotesList").getSelectedId()) {
            var itemId = $$("NotesList").getSelectedItem().title; // Изменить (выглядит ужасно)
            showNoteContent(itemId);
        } else {
            disableTextarea();
        }
        
    });

    // Появление Прогрес-бара при (пере)загрузке
    webix.extend($$("NotesList"), webix.ProgressBar);
    $$("NotesList").showProgress({
        type: "top",
        delay:3000,
        hide:true
    });

    webix.extend($$("NoteTextArea"), webix.ProgressBar);



    // *** Функциии после инициализации *** // А их тут надо? или в другом месте? [?] -

    loadNoteList();
    getData();

});