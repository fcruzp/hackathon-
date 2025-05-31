const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const departments = [
  {
    id: uuidv4(),
    name: 'Administración',
    description: 'Departamento de Administración y Finanzas',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Operaciones',
    description: 'Departamento de Operaciones y Logística',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Recursos Humanos',
    description: 'Departamento de Recursos Humanos',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Viceministerio Armas',
    description: 'Viceministerio De Armas',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Direccion Tecnologia',
    description: 'Direccion de Tecnologia y Comunicaciones',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const csvHeaders = 'id,name,description,created_at,updated_at\n';
const csvRows = departments.map(dept =>
  `"${dept.id}","${dept.name}","${dept.description}","${dept.created_at}","${dept.updated_at}"`
).join('\n');

const csvContent = csvHeaders + csvRows;

fs.writeFileSync('departments.csv', csvContent);

console.log('departments.csv file generated');
