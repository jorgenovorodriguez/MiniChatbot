// Instalamos las dependencias necesarias
const prompt = require('prompt-sync')({ sigint: true });
const parseArgs = require('minimist')(process.argv.slice(2));
const color = require('colors');
const { AutoComplete } = require('enquirer');
const fs = require('fs');

// Establecemos una constante para el nombre del usuario.
// De esta forma si añadimos --name=Nombre al ejecutar el programa, este se
// dirigirá a nosotros por el nombre proporcionado, si no lo hacemos no mencionará
// ningún otro nombre gracias al string vacío.
const name = parseArgs.name || ``;

//Importamos los datos del archivo inputs.json para que identifique respuestas
const jsonInputs = fs.readFileSync('inputs.json', 'utf-8');
const listaInputs = JSON.parse(jsonInputs);
const positivo = listaInputs.positivo;
const neutro = listaInputs.neutro;
const negativo = listaInputs.negativo;

// Creamos un menu de opciones para catalogar las respuestas no identificadas y poder
// añadirlas al archivo anterior
const menu = new AutoComplete({
    name: 'msg',
    message: `Lo siento ${name} no te he entendido, 
    ¿Podrías ayudarme a enterderte mejor diciendome a que sentimiento asociarías esa respuesta? 
    Despúes me gustaría intentarlo otra vez`.blue,
    limit: 4,
    choices: ['Positivo', 'Neutro', 'Negativo', 'Ninguno de los anteriores'],
});

// 1. Creamos una variable con un saludo inicial para empezar la conversación
const saludo = prompt(`Hola ${name} `.blue);

// Creamos una función que defina el funcionamiento de las respuestas
const respuestas = () => {
    //Variable que almacena la respuesta del usuario
    let input = prompt('¿Cómo estás hoy? '.blue);

    let inputFormateado;

    //Este if hace que sólo procese las respuestas que tengan contenido y que no sean valores nulos
    if (input) {
        //Variable que formatea la respuesta del usuario para que no genere errores al procesarla
        inputFormateado = input.toLowerCase();

        //Variable que usaremos para saber si la respuesta se ha entendido
        let inputReconocido = false;

        // A partir de aquí creamos 3 bucles que recorran cada uno de los arrays para intentar
        // asociar la respuesta a un sentimiento y contestar en consecuencia, si el programa no es
        // capaz de asociarlo al primer sentimiento, pasa al siguiente y así sucesivamente.
        // Si se lográ asociar la respuesta a un sentimiento, se da la contestación correspondiente,
        // se establece la variable inputReconocido como true, y se frena la ejecución del código
        try {
            for (let i = 0; i < positivo.length; i++) {
                if (inputFormateado.includes(positivo[i])) {
                    console.log(`Me alegro mucho ${name}, sigue así.`.blue);
                    inputReconocido = true;
                    break;
                }
            }

            for (let i = 0; i < neutro.length; i++) {
                if (inputFormateado.includes(neutro[i])) {
                    console.log(
                        `Ánimo ${name}, seguro que todo va a mejor`.blue
                    );
                    inputReconocido = true;
                    break;
                }
            }

            for (let i = 0; i < negativo.length; i++) {
                if (inputFormateado.includes(negativo[i])) {
                    console.log(
                        `No te vengas abajo, tú puedes con todo ${name}.`.blue
                    );
                    inputReconocido = true;
                    break;
                }
            }

            // En caso de que no se asocie la respuesta a ningún sentimiento la variable
            // inputReconocido seguiría siendo false, y por tanto entraríamos en este if.
            // En ese caso, se pide al usuario que ayude a identificar la respuesta a través
            // del menú de opciones, si puede hacerlo esa respuesta se añadira al archivo
            // inputs.json y de ahí en adelante la reconocerá ¡el ChatBot aprende!.
            if (!inputReconocido) {
                menu.run().then((choice) => {
                    switch (choice) {
                        case 'Positivo':
                            listaInputs.positivo.push(inputFormateado);
                            break;
                        case 'Neutro':
                            listaInputs.neutro.push(inputFormateado);
                            break;
                        case 'Negativo':
                            listaInputs.negativo.push(inputFormateado);
                            break;
                        default:
                            console.log(
                                'Entonces ignoraré esa respuesta, empecemos de nuevo.'
                            );
                            break;
                    }
                    fs.writeFileSync(
                        'inputs.json',
                        JSON.stringify(listaInputs),
                        'utf-8'
                    );
                    respuestas();
                });
            }
        } catch (err) {
            console.error(err);
        }

        //En caso de que la respuesta fuese nula o undefined, no se procesa nada y empieza otra vez
    } else {
        console.log(
            `Lo siento ${name} no te he entendido, me gustaría intentarlo otra vez.`
                .blue
        );
        respuestas();
    }
};

// 2. Llamamos a la función principal
respuestas();
