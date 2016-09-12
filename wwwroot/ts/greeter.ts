class Student {
    fullName: string;
    constructor(public firstName, public middleInitial, public lastName) {
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
}

interface Person {
    firstName: string;
    lastName: string;
}

function greeter(person : Person) {
    return "Hey, " + person.firstName + " " + person.lastName;
}

var user = new Student("Hoa is", "super", "handsome");

document.body.innerHTML = greeter(user);