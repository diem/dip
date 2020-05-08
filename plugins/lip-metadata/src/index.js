const fs = require('fs-extra');
const matter = require('gray-matter');
const path = require('path');

const lipsDir = path.join(__dirname, '../../../lips');
const fileToWrite = path.join(__dirname, '../../../LIPMetadata.json');
const {LIP_STATUS, LIP_TYPE} = require('../../../src/enums');

const fillObject = (obj, fill) =>
  Object.fromEntries(Object.entries(obj).map(([key, val]) => [val, fill()]));

const createErrorMessage = (fields, fileName)  => 
  `ERROR WHEN PROCESSING LIPS! File ${fileName} ` +
  `has invalid ${fields.length > 1 ? 'fields' : 'field'}: ` +
  `${fields.map(f => `"${f}"`).join(', ')}`;

const getInvalidFields = content => {
  const fieldsToValidate = {
    status: status => status !== undefined && Object.values(LIP_STATUS).includes(status),
    type: type => type !== undefined && Object.values(LIP_TYPE).includes(type),
  };

  return Object.entries(fieldsToValidate)
    .reduce((acc, [field, isValid]) => (
      isValid(content[field]) ? acc : acc.concat(field)
    ), []);
}

const formatMetadata = data =>
  Object.assign(data, {
    status: data.status ? data.status.toLowerCase() : undefined,
    type: data.type ? data.type.toLowerCase() : undefined,
  });

module.exports = function(context, options) {
  return {
    'name': 'lip-metadata',
    async loadContent() {
      const filesByType = fillObject(LIP_TYPE, () => fillObject(LIP_STATUS, () => []));

      return fs.readdir(lipsDir)
        .then(files => {
          return Promise.all(
            files.map(fileName => 
              Promise.all([fileName, fs.readFile(path.join(lipsDir, fileName))])
            )
          );
        })
        .then(files => {
          files.forEach(([fileName, fileContents]) => {
            const {data: metadata} = matter(fileContents);

            if (metadata.lip === undefined) {
              return;
            }

            const formattedMetadata = formatMetadata(metadata);
            const invalidFields = getInvalidFields(formattedMetadata);

            if (invalidFields.length) {
              return console.error(createErrorMessage(invalidFields, fileName));
            }

            const {type, status} = formattedMetadata;

            filesByType[type][status].push(metadata);
          });

          return fs.writeFile(fileToWrite, JSON.stringify(filesByType));
        });
    }
  };
};
