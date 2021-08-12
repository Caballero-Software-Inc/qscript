'use strict';

// Commons

let counts; //output of the quantum computation

let s;//string containing the Python program

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function afterMeasurement() {
    let files = document.getElementById('selectFiles').files;
    let fr = new FileReader();
    fr.onload = async function (e) {
        counts = await JSON.parse(e.target.result);
        switch (localStorage.getItem("pageqportlio")) {
            case "randomBitPage":
                randomBitAfter();
                break;
            case "deutschPage":
                deutschAfter();
                break;
            default:
                introPage();
                break;
        };
    }
    fr.readAsText(files.item(0));
}

function downloadFile() {
    download('circuit.txt', s);
}

function afterCode() {
    document.getElementById('mainId').innerHTML = '<p>Download the file: circuit.txt</p>';
    document.getElementById('mainId').innerHTML += '<button style="margin:5px;" onclick="downloadFile()">Download</button>';
    document.getElementById('mainId').innerHTML += '<p>Write in console: python3 circuit.txt</p>';
    document.getElementById('mainId').innerHTML += '<p>This action will produce the file: measurement.txt</p>';
    document.getElementById('mainId').innerHTML += '<p>Upload this new file</p><Br></Br>';
    document.getElementById('mainId').innerHTML += '<input type="file" id="selectFiles" value="Import" /><Br></Br>';
    document.getElementById('mainId').innerHTML += '<p>After uploading, click "Continue" to proceed with the computations.</p><Br></Br>';
    document.getElementById('mainId').innerHTML += '<button id="import" onclick = "afterMeasurement()">Continue</button>';
}

function addBackend() {
    document.getElementById('backendId').innerHTML = '<p>IBMQ Token</p>';
    document.getElementById('backendId').innerHTML += '<input id="backendInputId" type="text">';
}

function removeBackend() {
    document.getElementById('backendId').innerHTML = '';
}

// Deutsch algorithm

function deutschAfter() {
    const keys = Object.keys(counts);
    let max_val = 0;
    let max_index = 0;

    for (let j = 0; j < keys.length; j++) {
        if ((counts[keys[j]]) > max_val) {
            max_val = counts[keys[j]];
            max_index = j
        }
    };

    if (keys[max_index][1] == '0') {
        document.getElementById('mainId').innerHTML = '<p>The function is constant.</p><Br></Br>';
    } else {
        document.getElementById('mainId').innerHTML = '<p>The function is balanced.</p><Br></Br>';
    };

    document.getElementById('mainId').innerHTML += '<button style="margin:5px;" onclick="backToIntro()">Back to Intro</button>';

}

function deutschCode() {
    const f = [document.getElementsByName('f0')['1'].checked, document.getElementsByName('f1')['1'].checked];

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selection: "deutsch", input: f })
    };

    fetch('/api', options).then(async response => {
        let respo = await response.json();

        if (document.getElementsByName('backendradioId')['1'].checked) {
            // quantum hardware
            const token = document.getElementById('backendInputId').value;
            s = "from qiskit import IBMQ, execute, QuantumCircuit \n";
            s += "from qiskit.tools.monitor import job_monitor \n";
            s += "import sys \n"; //for the file
            s += "import json \n"; //compatibility with JavaScript        

            // quantum circuit
            s += respo.circuit;

            // after measurement
            s += "IBMQ.save_account('" + token + "', overwrite=True) \n";
            s += "IBMQ.load_account() \n";
            s += "provider = IBMQ.get_provider('ibm-q') \n"
            s += "qcomp = provider.get_backend('ibmq_lima') \n";
            s += "job = execute(circuit, backend=qcomp, shots = 100) \n"
            s += "job_monitor(job) \n";
            s += "result = job.result() \n";
            s += "counts = result.get_counts(circuit) \n";
            s += "with open('measurement.txt', 'w') as sys.stdout: \n";
            s += "  print(json.dumps(counts))"

        } else {
            // classical hardware
            s = "from qiskit import Aer, QuantumCircuit, assemble, transpile \n";
            s += "import sys \n"; //for the file
            s += "import json \n"; //compatibility with JavaScript


            // quantum circuit
            s += respo.circuit;


            // return to frontend
            s += "simulator = Aer.get_backend('qasm_simulator') \n";
            s += "circuit = transpile(circuit, simulator) \n";
            s += "my_qobj = assemble(circuit) \n";
            s += "result = simulator.run(my_qobj, shots = 100).result() \n";
            s += "counts = result.get_counts(circuit) \n";
            s += "with open('measurement.txt', 'w') as sys.stdout: \n";
            s += "  print(json.dumps(counts))"
        };
        afterCode();
    });
}

function deutschPage() {
    localStorage.setItem('pageqportlio', "deutschPage");
    document.getElementById('mainId').innerHTML = "<h1>Deutsch algorithm</h1>";
    document.getElementById('mainId').innerHTML += "<a href='https://www.wikiwand.com/en/Deutsch%E2%80%93Jozsa_algorithm'>Read about this quantum algorithm on Wikipedia.</a><Br></Br>";
    document.getElementById('mainId').innerHTML += "<label>f(0) = </label>";
    document.getElementById('mainId').innerHTML += '<input type="radio" id="f0is0" name="f0" value="0" checked>';
    document.getElementById('mainId').innerHTML += '<label for="f0is0">0</label>';
    document.getElementById('mainId').innerHTML += '<input type="radio" id="f0is1" name="f0" value="1">';
    document.getElementById('mainId').innerHTML += '<label for="f0is1">1</label><Br></Br>';
    document.getElementById('mainId').innerHTML += '<label>f(1) = </label>';
    document.getElementById('mainId').innerHTML += '<input type="radio" id="f1is0" name="f1" value="0" checked>';
    document.getElementById('mainId').innerHTML += '<label for="f1is0">0</label>';
    document.getElementById('mainId').innerHTML += '<input type="radio" id="f1is1" name="f1" value="1">';
    document.getElementById('mainId').innerHTML += '<label for="f1is1">1</label><Br></Br>';
    document.getElementById('mainId').innerHTML += '<input type="radio" id="backendradiosimulationId" name="backendradioId" onclick="removeBackend()" value="0" checked>';
    document.getElementById('mainId').innerHTML += '<label for="backendradiosimulationId">Simulation</label>';
    document.getElementById('mainId').innerHTML += '<input type="radio" id="backendradioquantumId" name="backendradioId" onclick="addBackend()" value="1">';
    document.getElementById('mainId').innerHTML += '<label for="backendradioquantumId">Quantum</label><Br></Br>';
    document.getElementById('mainId').innerHTML += '<div id="backendId"></div><Br></Br>';
    document.getElementById('mainId').innerHTML += '<button style="margin:5px;" onclick="deutschCode()">Generate Code</button>';
    document.getElementById('mainId').innerHTML += '<button style="margin:5px;" onclick="backToIntro()">Back to Intro</button>';
    document.getElementById('mainId').innerHTML += '<p id="answerId"></p>';
}

// Random bit algorithm

function randomBitAfter() {
    document.getElementById('mainId').innerHTML = '<p>Random bit: ' + Object.keys(counts)[0] + '</p><Br></Br>';
    document.getElementById('mainId').innerHTML += '<button style="margin:5px;" onclick="backToIntro()">Back to Intro</button>';
}


function randomBitCode() {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selection: "randomBit", input: '' })
    };

    fetch('/api', options).then(async response => {
        let respo = await response.json();

        if (document.getElementsByName('backendradioId')['1'].checked) {
            // quantum hardware
            const token = document.getElementById('backendInputId').value;

            s = "from qiskit import IBMQ, execute, QuantumCircuit \n";
            s += "from qiskit.tools.monitor import job_monitor \n";
            s += "import sys \n"; //for the file
            s += "import json \n"; //compatibility with JavaScript

            // quantum circuit
            s += respo.circuit;

            s += "IBMQ.save_account('" + token + "', overwrite=True) \n";
            s += "IBMQ.load_account() \n";
            s += "provider = IBMQ.get_provider('ibm-q') \n"
            s += "qcomp = provider.get_backend('ibmq_lima') \n";
            s += "job = execute(circuit, backend=qcomp, shots = 1) \n"
            s += "job_monitor(job) \n";
            s += "result = job.result() \n";
            s += "counts = result.get_counts(circuit) \n";
            s += "with open('measurement.txt', 'w') as sys.stdout: \n";
            s += "  print(json.dumps(counts))"
        } else {
            // classical hardware
            s = "from qiskit import Aer, QuantumCircuit, assemble, transpile \n";
            s += "import sys \n"; //for the file
            s += "import json \n"; //compatibility with JavaScript

            // quantum circuit
            s += respo.circuit;


            s += "simulator = Aer.get_backend('qasm_simulator') \n";
            s += "circuit = transpile(circuit, simulator) \n";
            s += "my_qobj = assemble(circuit) \n";
            s += "result = simulator.run(my_qobj, shots = 1).result() \n";
            s += "counts = result.get_counts(circuit) \n";
            s += "with open('measurement.txt', 'w') as sys.stdout: \n";
            s += "  print(json.dumps(counts))"
        };
        afterCode();
    });
}

function randomBitPage() {
    localStorage.setItem('pageqportlio', "randomBitPage");
    document.getElementById('mainId').innerHTML = "<h1>Random Bit Generator based on quantum Mechanics</h1>";
    document.getElementById('mainId').innerHTML += "<a href='https://www.wikiwand.com/en/Hardware_random_number_generator'>Read on Wikipedia about the use of quantum mechanics for random number generators.</a><Br></Br>";
    document.getElementById('mainId').innerHTML += '<input type="radio" id="backendradiosimulationId" name="backendradioId" onclick="removeBackend()" value="0" checked>';
    document.getElementById('mainId').innerHTML += '<label for="backendradiosimulationId">Simulation</label>';
    document.getElementById('mainId').innerHTML += '<input type="radio" id="backendradioquantumId" name="backendradioId" onclick="addBackend()" value="1">';
    document.getElementById('mainId').innerHTML += '<label for="backendradioquantumId">Quantum</label><Br></Br>';
    document.getElementById('mainId').innerHTML += '<div id="backendId"></div><Br></Br>';
    document.getElementById('mainId').innerHTML += '<button style="margin:5px;" onclick="randomBitCode()">Generate Code</button>';
    document.getElementById('mainId').innerHTML += '<button style="margin:5px;" onclick="backToIntro()">Back to Intro</button>';
}


// Intro page

function introPage() {
    document.getElementById('mainId').innerHTML = '<h1>Welcome to the (frontend) quantum portfolio of Caballero Software Inc.</h1>';
    document.getElementById('mainId').innerHTML += "<h4>This portfolio is open-source. <a href='https://github.com/Caballero-Software-Inc/qfrontend'>Repository in GitHub</a></h4>";

    document.getElementById('mainId').innerHTML += "<h4>Disclaimer: Caballero Software Inc. assumes no responsibility for the possible consequences of using the samples from this portfolio. Its use is at the user's own risk.</h4>";
    document.getElementById('mainId').innerHTML += "<h4>Privacy statement: Caballero Software Inc. will not collect data from the users of this portfolio.</a></h4>";

    document.getElementById('mainId').innerHTML += "<h2>Select a sample</h2>";
    document.getElementById('mainId').innerHTML += "<button onclick='randomBitPage()'>Random Bit</button> <Br></Br>";
    document.getElementById('mainId').innerHTML += "<button onclick='deutschPage()'>Deutsch Algorithm</button><Br></Br>";

    document.getElementById('mainId').innerHTML += "<h2>Contact</h2>";
    document.getElementById('mainId').innerHTML += "<h4>Caballero Software Inc.</h4>";
    document.getElementById('mainId').innerHTML += '<p style="white-space: pre-line">Address: 201 Lester St, Unit 303, Waterloo, ON Canada N2L 3W3 <br>';
    document.getElementById('mainId').innerHTML += 'Email: caballero@caballero.software <br><br>';
    document.getElementById('mainId').innerHTML += 'Phone: +1 (438) 993-2054 <br><br>';
    document.getElementById('mainId').innerHTML += 'Website: <a href="https://caballero.software/">https://caballero.software/</a></p>';
}

function backToIntro() {
    localStorage.setItem('pageqportlio', "intro");
    location.reload();
}

// Page selector

switch (localStorage.getItem("pageqportlio")) {
    case "randomBitPage":
        randomBitPage();
        break;
    case "deutschPage":
        deutschPage();
        break;
    default:
        introPage();
        break;
};