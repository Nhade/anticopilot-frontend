import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
    ...nextVitals,
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
        rules: {
            'react/no-unescaped-entities': 'off',
            '@next/next/no-img-element': 'off',
            'react-hooks/set-state-in-effect': 'off',
        }
    },
    {
        files: ['components/ui/**/*'],
        rules: {
            'react-hooks/purity': 'off',
            'react-hooks/exhaustive-deps': 'off',
        }
    },
    globalIgnores([
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
    ]),
])

export default eslintConfig