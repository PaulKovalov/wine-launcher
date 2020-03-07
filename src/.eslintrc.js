module.exports = {
    root:          true,
    env:           {
        node: true
    },
    globals:       {
        "$":         true,
        "_":         true,
        "moment":    true,
        "Switchery": true,
        "Ladda":     true,
        "swal":      true,
        "c3":        true,
        "app":       true,
        "Custombox": true,
    },
    'extends':     [
        'plugin:vue/essential',
        'eslint:recommended'
    ],
    parserOptions: {
        parser: 'babel-eslint'
    },
    rules:         {
        'no-console':        process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger':       process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-unused-vars':    'warn',
        'no-useless-escape': 'warn',
        'no-empty':          'warn',
    },
    overrides:     [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)'
            ],
            env:   {
                mocha: true
            }
        }
    ]
};
