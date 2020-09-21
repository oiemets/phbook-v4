import { firebaseDb } from './firebase-init';
import { state } from './index';

export async function getAllContacts() {
    let currentUser = state.uid;
    let contacts = [];
    let getContacts = await firebaseDb.ref('users/' + currentUser + '/contacts').once('value');
    let getValue = await getContacts.val();
    if(getValue) {
        contacts = getValue;
    };
    return contacts;
};

export async function addContact(contact) {
    let currentUser = state.uid;
    let contacts = await getAllContacts();
    if(contacts.find(c => c.email === contact.email)) {
        throw new Error(`contact: ${contact.email} already exists!`);
    }
    contacts.push(contact);
    firebaseDb.ref('users/' + currentUser + '/contacts').set([...contacts]);
}

export async function removeContact(index) {
    let currentUser = state.uid;
    let contacts = await getAllContacts();
    contacts.splice(index, 1);
    firebaseDb.ref('users/' + currentUser + '/contacts').set([...contacts]);
}


export async function getUserInfo(id) {
    let user = await firebaseDb.ref('users/' + id).once('value');
    let userInfo = await user.val();
    return userInfo;
}

export async function updateContact(index, update){
    let currentUser = state.uid;
    firebaseDb.ref('users/' + currentUser + '/contacts/' + index).update({...update});
}