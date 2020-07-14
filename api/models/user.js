const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String, 
        required: true, 
        unique: true, 
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    namaLengkap: {type: String},
    namaPanggilan: {type: String},
    jenisKelamin: {type: String},
    kelas: {type: String},
    provinsi: {type: String},
    kota: {type: String},
    sekolah: {type: String},
    created_at: {type: Date},
    updated_at: {type: Date}
});

module.exports = mongoose.model('User', userSchema);