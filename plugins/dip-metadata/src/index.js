const fs = require('fs-extra');
const matter = require('gray-matter');
const path = require('path');

const dipsDir = path.join(__dirname, '../../../dips');
const fileToWrite = path.join(__dirname, '../../../DIPMetadata.json');
const {DIP_STATUS, DIP_TYPE} = require('../../../src/enums');

const fillObject = (obj, fill) =>
  Object.fromEntries(Object.entries(obj).map(([key, val]) => [val, fill()]));

const createErrorMessage = (fields, fileName)  =>
  `ERROR WHEN PROCESSING DIPS! File ${fileName} ` +
  `has invalid ${fields.length > 1 ? 'fields' : 'field'}: ` +
  `${fields.map(f => `"${f}"`).join(', ')}`;

const getInvalidFields = content => {
  const fieldsToValidate = {
    status: status => status !== undefined && Object.values(DIP_STATUS).includes(status),
    type: type => type !== undefined && Object.values(DIP_TYPE).includes(type),
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
    'name': 'dip-metadata',
    async loadContent() {
      const filesByType = fillObject(DIP_TYPE, () => fillObject(DIP_STATUS, () => []));

      return fs.readdir(dipsDir)
        .then(files => {
          return Promise.all(
            files.map(fileName =>
              Promise.all([fileName, fs.readFile(path.join(dipsDir, fileName))])
            )
          );
        })
        .then(files => {
          files.forEach(([fileName, fileContents]) => {
            const {data: metadata} = matter(fileContents);

            if (metadata.dip === undefined) {
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
