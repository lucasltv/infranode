'use strict';

module.exports = {
    mongodb: {
        fieldTypes:
            [
                "String",
                "Number",
                "Array",
                "Date"
            ]
        ,
        drivers: [
            'mongoose'
        ]
    },
    mysql: {
        fieldTypes:
            [
                "UUID",
                "STRING",
                "TEXT"
            ],
        drivers: [
            'sequelize'
        ]
    }
}