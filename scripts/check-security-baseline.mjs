/**
 * Security baseline checks for the Gracon admin frontend.
 *
 * The checks protect the admin trust boundary, safe login redirects, and
 * production environment shape without requiring extra dependencies.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const errors = [];

const requiredEnvExampleKeys = [
    'NEXT_PUBLIC_ADMIN_API_URL',
    'NEXT_PUBLIC_FOREIGN_IDENTITY_API_URL',
    'NEXT_PUBLIC_SIGNATURE_API_URL',
    'NEXT_PUBLIC_STAMP_API_URL',
    'NEXT_PUBLIC_INSTITUTION_API_URL',
];

const requiredGitignoreEntries = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.production.local',
    'env',
    'env.local',
    'env.production',
    'env.production.local',
];

function parseEnv(source) {
    const values = new Map();
    for (const line of source.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const index = trimmed.indexOf('=');
        values.set(trimmed.slice(0, index), trimmed.slice(index + 1));
    }
    return values;
}

function walk(directory, files = []) {
    if (!existsSync(directory)) return files;

    for (const entry of readdirSync(directory)) {
        const absolute = join(directory, entry);
        const stats = statSync(absolute);
        if (stats.isDirectory()) {
            if (!['node_modules', '.next', 'out', 'coverage'].includes(entry)) {
                walk(absolute, files);
            }
            continue;
        }

        if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) files.push(absolute);
    }

    return files;
}

function checkEnvExample() {
    const envPath = join(projectRoot, '.env.example');
    if (!existsSync(envPath)) {
        errors.push('.env.example is required.');
        return;
    }

    const env = parseEnv(readFileSync(envPath, 'utf8'));
    for (const key of requiredEnvExampleKeys) {
        if (!env.has(key)) errors.push(`.env.example must document ${key}.`);
    }

    for (const key of env.keys()) {
        if (/^NEXT_PUBLIC_/.test(key) && /(SECRET|PASSWORD|PRIVATE|API_SECRET|CLIENT_SECRET)$/.test(key)) {
            errors.push(`.env.example must not expose sensitive key ${key} with NEXT_PUBLIC_.`);
        }
    }
}

function checkDeployEnv() {
    if (process.env.CHECK_DEPLOY_ENV !== 'true') return;

    for (const key of requiredEnvExampleKeys) {
        const value = process.env[key];
        if (!value) {
            errors.push(`${key} is required for production validation.`);
        } else if (!value.startsWith('https://')) {
            errors.push(`${key} must use HTTPS in production.`);
        }
    }
}

function checkGitignore() {
    const gitignorePath = join(projectRoot, '.gitignore');
    if (!existsSync(gitignorePath)) {
        errors.push('.gitignore is required.');
        return;
    }

    const entries = new Set(
        readFileSync(gitignorePath, 'utf8')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#')),
    );

    for (const entry of requiredGitignoreEntries) {
        if (!entries.has(entry)) errors.push(`.gitignore must ignore ${entry}.`);
    }
}

function checkSourceBoundary() {
    const sensitiveLocalStorage = /\blocalStorage\b.*(token|jwt|secret|password|private|nid|pid|passport)/i;
    const forbiddenUserAuthConfig = ['NEXT_PUBLIC_AUTH_API_URL', 'NEXT_PUBLIC_API_URL'];

    for (const file of walk(projectRoot)) {
        const relativePath = relative(projectRoot, file);
        if (relativePath.startsWith('scripts/')) continue;

        const lines = readFileSync(file, 'utf8').split(/\r?\n/);
        lines.forEach((line, index) => {
            if (line.trim().startsWith('//')) return;

            if (sensitiveLocalStorage.test(line)) {
                errors.push(`${relativePath}:${index + 1} must not persist sensitive data in localStorage.`);
            }

            for (const forbidden of forbiddenUserAuthConfig) {
                if (line.includes(forbidden)) {
                    errors.push(`${relativePath}:${index + 1} must not configure user-auth APIs inside app/admin.`);
                }
            }
        });
    }
}

function checkRedirectSafety() {
    const helperPath = join(projectRoot, 'lib/auth/redirect-safety.ts');
    if (!existsSync(helperPath)) {
        errors.push('lib/auth/redirect-safety.ts is required.');
        return;
    }

    const helper = readFileSync(helperPath, 'utf8');
    if (!helper.includes('BLOCKED_ADMIN_DESTINATIONS')) {
        errors.push('admin redirect helper must block login, invite, and logout destinations.');
    }

    const loginPath = join(projectRoot, 'components/pages/auth/LoginForm.tsx');
    const login = readFileSync(loginPath, 'utf8');
    if (!login.includes('resolveSafeAdminRedirect(next)')) {
        errors.push('LoginForm must resolve next through resolveSafeAdminRedirect.');
    }
    if (/router\.replace\(next\s*\?\?/.test(login)) {
        errors.push('LoginForm must not pass raw next values to router.replace.');
    }
}

checkEnvExample();
checkDeployEnv();
checkGitignore();
checkSourceBoundary();
checkRedirectSafety();

if (errors.length > 0) {
    console.error('Admin app security baseline failed:\n');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
}

console.log('Admin app security baseline passed.');
