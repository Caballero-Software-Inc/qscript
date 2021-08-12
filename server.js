'use strict';


const express = require('express');
const { getConstantValue } = require('typescript');
/* 
Copyright (c) 2009-2014 TJ Holowaychuk <tj@vision-media.ca>
Copyright (c) 2013-2014 Roman Shtylman <shtylman+expressjs@gmail.com>
Copyright (c) 2014-2015 Douglas Christopher Wilson <doug@somethingdoug.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
*/


/* creating app */
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('listening at ' + port));
app.use(express.static('public'));
app.use(express.json({ limit: '5mb' }));

function deutschCircuit(f) {
    let s = "circuit = QuantumCircuit(2, 2) \n";
    s += "circuit.x(1) \n";
    s += "circuit.h(0) \n";
    s += "circuit.h(1) \n";

    // oracle
    if (f[0] && f[1]) {
        s += "circuit.x(1) \n"
    }

    if (f[0] && !f[1]) {
        s += "circuit.cx(0,1) \n"
    }

    if (!f[0] && f[1]) {
        s += "circuit.x(1) \n";
        s += "circuit.cx(0,1) \n"
    }

    // after oracle
    s += "circuit.h(0) \n";
    s += "circuit.measure([0, 1], [0, 1]) \n";
    return s
}

function randomBitCircuit(x) {
    let s = "circuit = QuantumCircuit(1, 1) \n";
    s += "circuit.h(0) \n";
    s += "circuit.measure([0], [0]) \n";
    return s
}


app.post('/api', (request, response) => {
    switch (request.body.selection) {
        case "randomBit":
            response.json({ ok: true, circuit: randomBitCircuit(request.body.input) });
            break;
        case "deutsch":
            response.json({ ok: true, circuit: deutschCircuit(request.body.input) });
            break;
        default:
            response.json({ ok: false });
            break;
    };

});




