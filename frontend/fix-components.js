const fs = require('fs');

const files = [
    'src/app/features/admin/mensajeria/mensajeria.component.ts',
    'src/app/features/admin/validacion-pagos/validacion-pagos.component.ts',
    'src/app/features/chofer/dashboard-chofer/dashboard-chofer.component.ts',
    'src/app/features/cliente/tracking-viaje/tracking-viaje.component.ts',
    'src/app/features/rastreo/rastreo.component.ts',
    'src/app/shared/components/chat-panel/chat-panel.component.ts',
    'src/app/shared/components/chat-sidebar/chat-sidebar.component.ts'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    if (!content.includes('apiUrl = environment.apiUrl')) {
        content = content.replace(/(export class [A-Za-z0-9_]+[^{]*\{)/, "$1\n  apiUrl = environment.apiUrl;");
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(file, content);
        console.log(`Fixed ${file}`);
    }
}
