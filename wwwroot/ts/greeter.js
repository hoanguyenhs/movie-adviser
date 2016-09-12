var Student = (function () {
    function Student(firstName, middleInitial, lastName) {
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.lastName = lastName;
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
    return Student;
}());
function greeter(person) {
    return "Hey, " + person.firstName + " " + person.lastName;
}
var user = new Student("Hoa is", "super", "handsome");
document.body.innerHTML = greeter(user);
