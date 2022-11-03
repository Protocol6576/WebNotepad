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

// *** Функции по обращению к серверу ***

function loadNoteList() {
    $$("NotesList").clearAll(); // Заменить на аргумент в функции load (Который true)
    $$("NotesList").load(function() {
        return webix.ajax().get('api/getNoteTitles');
    });
    disableTextarea();
}

function redactNoteContent(noteName, newText) {
    var reqResult = webix.ajax().get('api/redactNoteContent/' + noteName + '/' + newText); // Лучше сделать так, или .then?

    if(reqResult) {
        webix.message('Текст заметки изменен');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }

}

function showNoteContent(noteName) {
    webix.ajax().get('api/showNoteContent/' + noteName).then(function(data) {
        data = data.text();
        $$("NoteTextArea").setValue(data);
        $$("NoteTextArea").enable();
        $$("NoteTextArea").focus();
    });
}

function renameNote(noteName, newNoteName, noteId) {
    var reqResult = webix.ajax().get('api/renameNote/' + noteName + '/' + newNoteName);

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
    var reqResult = webix.ajax().get('api/createNote/' + newNoteName);

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
    var reqResult = webix.ajax().get('api/deleteNote/' + noteName);

    if(reqResult) {
        $$("NotesList").remove(noteId);
        webix.message('Заметка удалена');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }
}

function disableTextarea() {
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
                                height: 40,
                                type: 'clean',

                                cols: [
                                    {
                                        view:'search',
                                        id: 'NotesList_input',

                                        placeholder: 'Найти...',
                                    },
                                    {
                                        // Обновить список
                                        view: 'icon',
                                        icon: 'wxi-sync',
                                        click: function() {
                                            loadNoteList();
                                        },
                                    },
                                    {
                                        // Создать файл. Добавить вывод в случае наличия такого же файла, а не окошко блин
                                        view: 'icon',
                                        icon: 'wxi-plus-circle',
                                        click: function() {
                                            webix.prompt({
                                                title:"Создание заметки",
                                                text:"Введите название новой заметки",
                                                ok:"Submit",
                                                cancel:"Cancel",
                                                input:{
                                                  required:true,
                                                  placeholder:"Ваше название",
                                                },
                                                width: 350,
                                            }).then(function(result){
                                                createNote(result);
                                            });

                                            
                                        },
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
                                ready: function() {
                                    loadNoteList();
                                    disableTextarea(); // Переместить бы это куда-нибудь, да вот только у textArea нету параметра "ready" для такого
                                },

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
                                            var itemId = $$("NotesList").getSelectedItem().title; // Изменить (выглядит ужасно)
                                            var newText = $$("NoteTextArea").getValue();
                                            redactNoteContent(itemId, newText);
                                        },
                                    }
                                ]
                                
                            },
                            {
                                view: 'textarea', // Убрать блин эти бортики! БЕСЯТ!!
                                id: 'NoteTextArea',
                                placeholder: 'Напишите что-то здесь',

                                attributes: {
                                    maxlength: 20,
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
                var context = this.getContext(); // Зачем так много переменных? ИСПРАВИТЪ!!!
                var list = context.obj;
                var itemId = context.id;
                var itemTitle = list.getItem(itemId).title;

                switch (id) {
                    case "Переименовать":
                        webix.prompt({
                            title:"Переименование заметки",
                            text:"Введите новое название заметки",
                            ok:"Submit",
                            cancel:"Cancel",
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

});