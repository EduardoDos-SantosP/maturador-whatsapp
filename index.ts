import { Client, LocalAuth } from "whatsapp-web.js";
import qrcodeTerminal from "qrcode-terminal";

async function main(count: number) {
    const clients: Client[] = []
    const contacts: string[] = []
    
    for (let i = 0; i < count; i++) {
        const client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'client_' + i
            }),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            },
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2410.1.html',
            }
        })
        clients.push(client)
        
        client.on('qr', qr => {
            qrcodeTerminal.generate(qr, { small: true })
        })
        for (const e of ['loading_screen', 'authenticated', 'auth_failure', 'ready', 'disconnected'])
            client.on(e, () => console.log(i + ' ' + e))
        
        await client.initialize()
        
        const contactId = client.info.wid._serialized
        contacts.push(contactId)
        
        process.once('SIGINT', async () => await client.destroy())
        process.once('SIGTERM', async () => await client.destroy())
    }
    
    try {
        while (true)
            for (let i = 0; i < clients.length; i++) {
                for (let j = 0; j < contacts.length; j++) {
                    if (i === j || Math.random() < .25) continue
                    const client = clients[i]
                    const contact = contacts[j]
                    
                    const msg = await fetch('https://baconipsum.com/api/?type=all-meat-filler&paras=1')
                        .then(response => response.json())
                        .then(data => data[0].slice(0, 20 + Math.random() * 100))
                    
                    await client.sendMessage(contact, msg)
                    console.log(`${contacts[i]} -> ${contact}`)
                    await new Promise(resolve => setTimeout(resolve, (30 + Math.random() * 60) * 1000))
                }
            }
    } catch (e) {
        return main(count)
    }
}

const numeroDeContasParaConectar = 2 //Altere aqui para customizar

main(numeroDeContasParaConectar)