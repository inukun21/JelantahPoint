/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'src/database');
const USERS_PATH = path.join(DB_DIR, 'users.json');
const PRODUCTS_PATH = path.join(DB_DIR, 'products.json');
const DROP_POINTS_PATH = path.join(DB_DIR, 'drop_points.json');
const DEPOSIT_REQUESTS_PATH = path.join(DB_DIR, 'deposit_requests.json');

function readJsonFile(filePath: string, defaultValue: any) {
    try {
        if (!fs.existsSync(filePath)) {
            return defaultValue;
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return defaultValue;
    }
}

export function readDB() {
    const users = readJsonFile(USERS_PATH, []);
    const products = readJsonFile(PRODUCTS_PATH, []);
    const dropPoints = readJsonFile(DROP_POINTS_PATH, []);
    const depositRequests = readJsonFile(DEPOSIT_REQUESTS_PATH, []);

    return {
        users,
        products,
        dropPoints,
        depositRequests
    };
}

export function writeDB(data: any) {
    try {
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }

        if (data.users) fs.writeFileSync(USERS_PATH, JSON.stringify(data.users, null, 2), 'utf8');
        if (data.products) fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(data.products, null, 2), 'utf8');
        if (data.dropPoints) fs.writeFileSync(DROP_POINTS_PATH, JSON.stringify(data.dropPoints, null, 2), 'utf8');
        if (data.depositRequests) fs.writeFileSync(DEPOSIT_REQUESTS_PATH, JSON.stringify(data.depositRequests, null, 2), 'utf8');

        return true;
    } catch (error) {
        console.error('Error writing DB:', error);
        return false;
    }
}
