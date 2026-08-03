import fs from 'node:fs';

const app = fs.readFileSync('src/App.jsx', 'utf8');
const data = fs.readFileSync('src/data/smkForms.js', 'utf8');
const component = fs.readFileSync('src/components/SMKReportFormPage.jsx', 'utf8');

if (!app.includes('import SMKReportFormPage from "./components/SMKReportFormPage"')) throw new Error('App belum mengimpor komponen SMK modular');
if (app.includes('const SMK_FORMS')) throw new Error('Daftar form masih berada di App.jsx');
if (!data.includes('export const SMK_FORMS')) throw new Error('Registry form belum tersedia');
if (!component.includes('placeholder="Cari kode atau nama form..."')) throw new Error('Pencarian form belum tersedia');
if (!component.includes('categoryFilter')) throw new Error('Filter kategori belum tersedia');
if (!component.includes('<iframe')) throw new Error('Pembuka form belum tersedia');

console.log('SMK modular verification passed');
