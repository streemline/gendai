export const translations = {
  ru: {
    form: {
      date: "Дата",
      eventName: "Название мероприятия",
      eventLocation: "Место проведения",
      description: "Описание деятельности",
      startTime: "Время начала",
      endTime: "Время окончания",
      breakDuration: "Перерыв (минут)",
      hourlyRate: "Ставка (Крон/час)",
      totalHours: "Всего часов",
      totalAmount: "Общая сумма",
      signature: "Подпись",
      submit: "Сохранить",
      clear: "Очистить",
      export: "Экспорт",
      exportFormats: {
        pdf: "Экспорт в PDF",
        excel: "Экспорт в Excel"
      }
    },
    stats: {
      title: "Статистика",
      totalHours: "Всего часов",
      totalAmount: "Общая сумма",
      byDay: "По дням"
    }
  },
  uk: {
    form: {
      date: "Дата",
      eventName: "Назва заходу",
      eventLocation: "Місце проведення",
      description: "Опис діяльності",
      startTime: "Час початку",
      endTime: "Час закінчення", 
      breakDuration: "Перерва (хвилин)",
      hourlyRate: "Ставка (Крон/година)",
      totalHours: "Всього годин",
      totalAmount: "Загальна сума",
      signature: "Підпис",
      submit: "Зберегти",
      clear: "Очистити",
      export: "Експорт",
      exportFormats: {
        pdf: "Експорт у PDF",
        excel: "Експорт в Excel"
      }
    },
    stats: {
      title: "Статистика",
      totalHours: "Всього годин",
      totalAmount: "Загальна сума", 
      byDay: "По днях"
    }
  },
  cs: {
    form: {
      date: "Datum",
      eventName: "Název akce",
      eventLocation: "Místo konání",
      description: "Popis činnosti",
      startTime: "Čas začátku",
      endTime: "Čas konce",
      breakDuration: "Přestávka (minut)",
      hourlyRate: "Sazba (Kč/hod)",
      totalHours: "Celkem hodin",
      totalAmount: "Celková částka",
      signature: "Podpis",
      submit: "Uložit",
      clear: "Vymazat",
      export: "Export",
      exportFormats: {
        pdf: "Export do PDF",
        excel: "Export do Excelu"
      }
    },
    stats: {
      title: "Statistika",
      totalHours: "Celkem hodin",
      totalAmount: "Celková částka",
      byDay: "Po dnech"
    }
  }
};

export type Language = keyof typeof translations;