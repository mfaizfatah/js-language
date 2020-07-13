const amqp = require('amqplib')     // Import library amqp

const courier = 'log_node_shop'

exports.sendLog = (data) => {
    amqp.connect('amqp://localhost')
    .then(conn => {
        return conn.createChannel().then(ch => {
        // const msg = data    // Isi pesan yang dikirim ke RabbitMQ

          // Memanggil kurir 'queue1'
        const queue1 = ch.assertQueue(courier, { durable: false })    
      
        // Mengirim pesan ke kurir 'queue1'
        ch.sendToQueue(courier, Buffer.from(JSON.stringify(data)))     
        console.log('- Sent', data)

        }).finally(() => {
        //Tutup koneksi ke RabbitMQ setelah selesai menggunakan.
            setTimeout(function() { conn.close(); }, 500);
        })
}).catch(console.warn)
}