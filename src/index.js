import './main.css';
import regeneratorRuntime from 'regenerator-runtime';

import { loader } from './loader';
import { firebaseAuth, firebaseDb } from './firebase-init';
import { getAllContacts, addContact, removeContact, getUserInfo, updateContact } from './db';

export let state = {
    uid: null,
    user: null,
    email: null,
    loader: false,
    contacts: []
};

function setState(newState) {
    state = {...newState};
    app();
}

(async () => {
    setState({...state, loader: true});
    firebaseAuth.onAuthStateChanged(async (user) => {
        if(user){
            setState({...state, uid: user.uid, email: user.email, loader: false});
            let userInfo = await getUserInfo(state.uid);
            // let contacts = await getAllContacts();
            setState({...state, user: userInfo});
        } else {
            setState({...state, loader: false});
        }
    })
})();


async function app() {
    const root = document.querySelector('#root');
    root.innerHTML = '';
    root.append(navRender({loggedIn: state.email, listener: navHandler}));
    if(state.loader) {
        root.innerHTML = loader();
    } else if (state.uid) {
        let contacts = await getAllContacts();
        root.append(contactsView(contacts));
    }
}


function navRender({loggedIn, listener}) {
    const header = document.createElement('header');
    const nav = document.createElement('nav');
    nav.className = 'container';
    const ul = document.createElement('ul');
    ul.innerHTML = 
        unorderedList(
            loggedIn ? 
                [
                    {href: 'currentUser', content: loggedIn},
                    {href: 'contacts', content: 'contacts'},
                    {href: 'add', content: 'add contact'},
                    {href: 'logout', content: 'log out'},
                ] :
                [
                    {href: 'currentUser', content: 'no@user'},
                    {href: 'login', content: 'log in'},
                    {href: 'signin', content: 'sign in'}
                ]
        );
    
    nav.addEventListener('click', (e) => {
        e.preventDefault();
        listener(e.target.getAttribute('href'), root);
    });

    nav.append(ul);
    header.append(nav);
    return header;
};

function unorderedList(items){
    return items.reduce(
        (result, {content, href}) =>
            result + `<li><a href="${href}">${content}</a></li>`,
        ''
    );
};

async function navHandler(path, root) {
    switch (path) {
        case 'add':
        case 'login':
        case 'signin':
            root.prepend(form(path));
        break;
        case 'logout':
            setState({...state, email: null, uid: null, loader: true});
            await firebaseAuth.signOut();
            setState({...state, loader: false});
        break;
        case 'contacts':
            setState({...state, loader: true});
            await getAllContacts();
            setState({...state, loader: false});
        break;
        case 'currentUser':
            if(state.email){
                setState({...state, loader: true});
                let userInf = await getUserInfo(state.uid);
                setState({...state, loader: false});
                alert(userInf.email + ' - ' + userInf.fullname);
            }
        break;
    }
}






// form:
function form(type, contact, index) {
    const div = elemCreator('div');
    div.className = 'form_holder';
    const form = getForm(type, contact);

    const onSubmit = e => {
        e.preventDefault();
        new FormData(form);
    }

    const onFormData = e => {
        const data = e.formData;
        const formObject = Object.fromEntries(data.entries());
        dataStreamer(type, formObject, index);
        form.reset();
    }

    form.addEventListener('submit', onSubmit);
    form.addEventListener('formdata', onFormData)

    const clickOutside = e => {
        if(e.target.className === 'form_holder') {
            div.remove();
            div.removeEventListener('click', clickOutside);
            form.removeEventListener('submit', onSubmit);
            form.removeEventListener('formdata', onFormData);
        }
    };

    div.addEventListener('click', clickOutside);

    div.append(form);

return div;

}

function elemCreator(elem){
    return document.createElement(elem);
}

function inputCreator(type, name, placeholder, value) {
    const input = elemCreator('input');
    input.type = type;
    input.name = name;
    input.placeholder = placeholder;
    input.value = value;
    return input;
}

function getForm(type, contact) {
    const form = elemCreator('form');
    form.className = 'form';
    const btn = elemCreator('button');

    switch (type) {
        case 'login':
            btn.innerText = 'log in';
            form.append(
                inputCreator('text', 'email', 'email', ''),
                inputCreator('password', 'password', 'password', ''),
                btn
            );
            break;
        case 'signin':
            btn.innerText = 'sign in';
            form.append(
                inputCreator('text', 'fullname', 'full name', ''),
                inputCreator('text', 'email', 'email', ''),
                inputCreator('text', 'phone', 'phone', ''),
                inputCreator('text', 'address', 'address', ''),
                inputCreator('password', 'password', 'password', ''),
                btn
            );   
            break;
        case 'add':
            btn.innerText = 'add';
            form.append(
                inputCreator('text', 'fullname', 'full name', ''),
                inputCreator('text', 'email', 'email', ''),
                inputCreator('text', 'phone', 'phone', ''),
                inputCreator('text', 'address', 'address', ''),
                inputCreator('text', 'desc', 'description', ''),
                btn
            );      
            break;
        case 'edit':
            btn.innerText = 'save';
            form.append(
                inputCreator('text', 'fullname', 'full name', `${contact.fullname}`),
                inputCreator('text', 'email', 'email', `${contact.email}`),
                inputCreator('text', 'phone', 'phone', `${contact.phone}`),
                inputCreator('text', 'address', 'address', `${contact.address}`),
                inputCreator('text', 'desc', 'description', `${contact.desc}`),
                btn
            );  
            break;
    }
    return form;
};

async function dataStreamer(type, formObject, index) {
    switch (type) {
        case 'signin':
            setState({...state, loader: true});
            await firebaseAuth.createUserWithEmailAndPassword(formObject.email, formObject.password);
            firebaseDb.ref('users/' + firebaseAuth.currentUser.uid).set(formObject);
            setState({...state, loader: false});
            break;
        case 'login':
            setState({...state, loader: true});
            await firebaseAuth.signInWithEmailAndPassword(formObject.email, formObject.password);
            setState({...state, loader: false});
            break;
        case 'add':
            setState({...state, loader: true});
            await addContact(formObject).catch(e => alert(e));
            setState({...state, loader: false});
            break;
        case 'edit':
            setState({...state, loader: true});
            await updateContact(index, formObject);
            setState({...state, loader: false});
            break;
    }
};




// contacts:
function contactsView(contacts) {
    const root = document.querySelector('#root');
    const div = elemCreator('div');
    div.className = 'contacts container';
    div.innerHTML = contacts.map((contact, index) => contactRendering(contact, index)).join('');
    let currentActiveContact;
    let currentDetails;

    const editBtn = elemCreator('button');
    editBtn.className = 'editBtn';
    editBtn.innerText = 'edit';

    const removeBtn = elemCreator('button');
    removeBtn.className = 'removeBtn';
    removeBtn.innerText = 'remove';

    const activeHandler = e => {
        const target = findParentWithClass(e.target, 'contact');
        const details = contactDetails(contacts[target.getAttribute('data-index')]);
        if(!target){
            return;
        }
        target.append(details, editBtn, removeBtn);
        target.classList.add('active');
        if(currentActiveContact) {
            currentActiveContact.classList.remove('active');
            currentDetails.remove();
        }
        currentActiveContact = target;
        currentDetails = details;
    };
    div.addEventListener('click', activeHandler);




    const editBtnHandler = async (e) => {
        let contact = findParentWithClass(e.target, 'contact');
        let contactIndex = contact.getAttribute('data-index');
        let contacts = await getAllContacts();
        let currentContact = contacts[contactIndex];
        root.prepend(form('edit', currentContact, contactIndex));
    };
    editBtn.addEventListener('click', editBtnHandler);


    const removeBtnHandler = async (e) => {
        setState({...state, loader: true});
        let contact = findParentWithClass(e.target, 'contact');
        let contactIndex = contact.getAttribute('data-index');
        await removeContact(contactIndex);
        setState({...state, loader: false});
    };
    removeBtn.addEventListener('click', removeBtnHandler);
    return div;
}

function contactRendering(contact, index) {
    return `
        <div class="contact" data-index="${index}">
            <h2>${contact.fullname}</h2>
            <h3>${contact.phone}</h3>
        </div>
        <hr>
    `
};

function contactDetails(contact) {
    const div = elemCreator('div');
    div.className = 'details';
    div.innerHTML = `
        <h3>${contact.email}</h3>
        <h3>${contact.address}</h3>
        <h3>${contact.desc}</h3>
    `;
    return div;
};

function findParentWithClass(target, className) {
    if(!target) {
        return null;
    }
    if(target.classList.contains(className)) {
        return target;
    }
    return findParentWithClass(target.parentElement, className);
};



