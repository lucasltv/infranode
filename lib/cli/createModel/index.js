/**
 * Create model prompt
 * run by writing `node createModel.js` in your console
 */

'use strict';
var inquirer = require('inquirer');
var fs = require('fs');
var pluralize = require('pluralize')
var { constants } = require('../../constants');
var log = console.log;

var baseModelQuestions = [
    {
        type: 'list',
        name: 'dbType',
        message: 'What type of database?',
        choices: ['MongoDB (Mongoose)', 'MySQL (Sequelize)'],
        filter: (val) => val.split(' ')[0].toLowerCase()
    },
    {
        type: 'input',
        name: 'name',
        message: "Model name:",
        validate: value => {
            if (value.length > 2) {
                return true;
            }
            return 'Please enter a valid model name (at least 2 digits).';
        },
        filter: val => val.toLowerCase()
    },
    {
        type: 'input',
        name: 'path',
        message: "Path:",
        validate: value => {
            if (value.length > 2) {
                return true;
            }
            return 'Please enter a valid model name (at least 2 digits).';
        },
        default: answers => `app/models/${answers.dbType}/${getDriver(answers.dbType)}/${answers.name}Model.js`
    },
    {
        type: 'input',
        name: 'table',
        message: (answers) => {
            switch (answers.name) {
                case 'mongodb':
                    return "Collection name:";
                default:
                    return "Table name:";
            }
        },
        validate: (value) => {
            if (value.length > 2) {
                return true;
            }
            return 'Please enter a valid collection name (at least 2 digits).';
        },
        filter: val => {
            return val.toLowerCase();
        },
        default: answers => {
            return pluralize(answers.name)
        }
    },
    {
        type: 'confirm',
        name: 'timestamps',
        message: `Fill timestamps fields automatically (createdAt and updatedAt)?`,
        default: true
    },
    {
        type: 'confirm',
        name: 'softdelete',
        message: `Use soft deletes (field deletedAt)?`,
        default: false
    },
];

function getFieldQuestions(index, baseModel) {
    return [
        {
            type: 'input',
            name: 'name',
            message: `Field #${index + 1} name:`,
            validate: (value) => {
                if (value.length < 2) {
                    return 'Please enter a valid field name (at least 2 digits).';
                }
                return true;
            },
        },
        {
            type: 'list',
            name: 'type',
            message: answers => `Type of '${answers.name}' field:`,
            choices: getFieldTypeChoices(baseModel.dbType)
        },
        {
            type: 'confirm',
            name: 'required',
            message: 'Required (NOT NULL)?',
            default: false
        },
        {
            type: 'confirm',
            name: 'confirmed',
            message: answers => `Please, confirm answers before continue:\n ${JSON.stringify({ ...answers })} \n Confirm?`,
            default: true
        },
        {
            type: 'confirm',
            name: 'addMore',
            message: answers => answers.confirmed ? "Do you want to add more one field?" : "This field will not be saved. Do you want to add more one field?",
            default: true
        },
    ]
}

function getFieldTypeChoices(dbType) {
    switch (dbType) {
        case 'mongodb':
            return constants.mongodb.fieldTypes;
        case 'mysql':
        default:
            return constants.mysql.fieldTypes;
    }
}

function getDriver(dbType) {
    switch (dbType) {
        case 'mongodb':
            return constants.mongodb.drivers[0];
        case 'mysql':
        default:
            return constants.mysql.drivers[0];
    }
}

function getHeaders(model) {
    let headers = "";
    switch (model.dbType) {
        case 'mongodb':
            headers += "var mongoose = require('mongoose');\n";
            if (model.softdelete) headers += "var mongoose_delete = require('mongoose-delete');\n"
            break;
        case 'mysql':
        default:
            return "TODO:"
    }
    headers += "\n";
    return headers;
}

function writeFile(model) {
    try {
        const { path } = model;
        const fullPath = `${__dirname}/../../../../../${path}`;
        let template = getTemplate(model)
        fs.writeFileSync(fullPath, template);
        console.log(`Model '${model.name}' created!`);
    } catch (err) {
        console.error(`Cant find path. Please, check if the path (${path}) exists.`)
    }
}


// writeFile(
//     {
//         dbType: 'mongodb',
//         name: 'device',
//         path: 'app/models/mongodb/mongoose/deviceModel.js',
//         table: 'devices',
//         timestamps: true,
//         softdelete: false,
//         fields: [{ name: 'name', type: 'String', required: true }]
//     }
// );

function getSchema(model) {
    var schemaTemplate = "";
    const camelCaseModelName = `${model.name}Model`;
    switch (model.dbType) {
        case 'mongodb':
            schemaTemplate += `var ${camelCaseModelName} = new mongoose.Schema({\n`
            model.fields.forEach(field => {
                schemaTemplate += `\t${field.name}: {\n`

                schemaTemplate += `\t\ttype: ${field.type},\n`
                schemaTemplate += `\t\trequired: ${field.required},\n`

                schemaTemplate += `\t},\n`
            });

            if (model.timestamps) {
                schemaTemplate += `}, { timestamps: { updatedAt: 'updatedAt' } });\n\n`
            } else {
                schemaTemplate += `});\n\n`
            }
            if (model.softdelete) {
                schemaTemplate += `${camelCaseModelName}.plugin(mongoose_delete); \n\n`
            }
            schemaTemplate += `module.exports = mongoose.model('${model.name}', ${camelCaseModelName}, '${model.table}');`
            break;
        case 'mysql':
        default:
        //TODO:
    }

    return schemaTemplate;
}

function getTemplate(model) {
    let template = "'use strict'\n\n";
    template += getHeaders(model)
    template += getSchema(model)

    return template;
}

module.exports = function () {
    log('Hi, welcome to INFRANODE model generator!');
    inquirer.prompt(baseModelQuestions).then(async baseModel => {
        log('NOTE: ID fields are automatically generated.')
        let fields = [];
        let addMore = true;
        while (addMore) {
            const index = fields.length;
            const fieldQuestions = getFieldQuestions(index, baseModel);
            try {
                let answers = await inquirer.prompt(fieldQuestions);
                let { confirmed, addMore, ...restExceptAddMore } = answers;
                if (answers.confirmed) fields.push(restExceptAddMore);
                if (!answers.addMore) break;
            } catch (err) {
                log("ERROR: ", err.toString());
                process.exit(1);
            }
        }

        if (fields.length === 0) {
            log("Empty fields. Your model was not saved.");
            process.exit(0);
        }
        const finalModel = { ...baseModel, fields };
        return writeFile(finalModel);
    });
}