const { isObjectId, createTestData, getUniqueClassName, getUniqueVkId } = require( '../utils/functions' );
const { DataBase } = require( '../DataBase' );
const mongoose = require( "mongoose" );
const Class = require( '../Models/ClassModel' );
const Student = require( "../Models/StudentModel" );

describe( "addChanges", () => {
    let MockClass;
    let MockStudent;
    let StudentWithoutClass;
    let ClassWithoutStudent;
    beforeAll( async () => {
        const { Class: c, Student: s } = await createTestData();
        const wcu = await DataBase.createStudent( getUniqueVkId() );
        const wsc = await DataBase.createClass( getUniqueClassName() );
        MockStudent = s;
        MockClass = c;
        StudentWithoutClass = wcu;
        ClassWithoutStudent = wsc;
    } );
    afterAll( async () => {
        await Class.deleteMany( {} );
        await Student.deleteMany( {} );
    } );
    afterEach( async () => {
        await Class.deleteMany( {} );
        await Student.deleteMany( {} );
        const { Class: c, Student: s } = await createTestData();
        const wcu = await DataBase.createStudent( getUniqueVkId() );
        const wsc = await DataBase.createClass( getUniqueClassName() );
        MockStudent = s;
        MockClass = c;
        StudentWithoutClass = wcu;
        ClassWithoutStudent = wsc;
    } );

    it( "should return change id if all is ok", async () => {
        const content = {
            attachments: [ "photo123_123_as41" ],
            text: "changes"
        };

        const result = await DataBase.addChanges( MockClass.name, content );

        return expect( isObjectId( result ) ).toBe( true );
    } );
    it( "should add all changes to class", async () => {
        const content = {
            attachments: [ "photo123_123_as41" ],
            text: "changes"
        };

        const id = await DataBase.addChanges( MockClass.name, content );

        const updatedClass = await DataBase.getClassBy_Id( MockClass._id );

        expect( updatedClass.changes.length ).toBe( 1 );
        expect( updatedClass.changes.find( change => change._id.toString() === id.toString() ) ).not.toBeUndefined();
    } );
    it( "should add changes to all classes if toAll prop passed", async () => {
        const content = {
            attachments: [ "photo123_123_as41" ],
            text: "changes"
        };

        const id = await DataBase.addChanges( MockClass.name, content, undefined, true );

        const updatedClass = await DataBase.getClassBy_Id( MockClass._id );
        const updatedClass1 = await DataBase.getClassBy_Id( ClassWithoutStudent._id );

        expect( updatedClass.changes.length ).toBe( 1 );
        expect( updatedClass.changes.find( change => change._id.toString() === id.toString() ) ).not.toBeUndefined();
        expect( updatedClass1.changes.length ).toBe( 1 );
        expect( updatedClass1.changes.find( change => change._id.toString() === id.toString() ) ).not.toBeUndefined();
    } );
    it( "shouldn't add createdBy prop if student vkId is passed", async () => {
        const content = {
            attachments: [ "photo123_123_as41" ],
            text: "changes"
        };

        const result = await DataBase.addChanges( MockClass.name, content, undefined, undefined, MockStudent.vkId );

        const updatedClass = await DataBase.getClassBy_Id( MockClass._id );

        expect( isObjectId( result ) ).toBe( true );
        expect( updatedClass.changes.find( change => change._id.toString() === result.toString() ).createdBy ).toBe( MockStudent.vkId );
    } );
} );

describe( "getChanges", () => {
    const content1 = {
        attachments: [ "photo111_111_as41" ],
        text: "changes1"
    };
    const content2 = {
        attachments: [ "photo222_222_as41" ],
        text: "changes2"
    };
    let chId1;
    let chId2;
    let className;
    let vkId;

    beforeAll( async () => {
        const { Class: c, Student: s } = await createTestData();
        className = c.name;
        chId1 = await DataBase.addChanges( c.name, content1 );
        chId2 = await DataBase.addChanges( c.name, content2 );
        vkId = s.vkId;
    } );
    afterAll( async () => {
        await Class.deleteMany( {} );
        await Student.deleteMany( {} );
    } )
    afterEach( async () => {
        await Student.deleteMany( {} );
        await Class.deleteMany( {} );
        const { Class: c, Student: s } = await createTestData();
        className = c.name;
        await DataBase.addChanges( c.name, content1 );
        await DataBase.addChanges( c.name, content2 );
    } )
    it( "should return array of changes for that class", async () => {
        const result = await DataBase.getChanges( className );
        const content = {
            attachments: [ "photo123_123_as41" ],
            text: "changes"
        };

        const id = await DataBase.addChanges( className, content );

        const updatedClass = await DataBase.getClassByName( className );

        expect( Array.isArray( result ) ).toBe( true );
        expect( result.length ).toBe( 2 );
        expect( updatedClass.changes.find( change => change._id.toString() === chId1.toString() ) ).not.toBeUndefined();
        expect( updatedClass.changes.find( change => change._id.toString() === chId2.toString() ) ).not.toBeUndefined();
    } );
} );

describe( "removeChanges", () => {
    const content1 = {
        attachments: [ "photo111_111_as41" ],
        text: "changes1"
    };
    const content2 = {
        attachments: [ "photo222_222_as41" ],
        text: "changes2"
    };
    let chId1;
    let chId2;
    let className;
    let vkId;

    beforeAll( async () => {
        const { Class: c, Student: s } = await createTestData();
        className = c.name;
        chId1 = await DataBase.addChanges( c.name, content1 );
        chId2 = await DataBase.addChanges( c.name, content2 );
        vkId = s.vkId;
    } );
    afterAll( async () => {
        await Class.deleteMany( {} );
        await Student.deleteMany( {} );
    } )
    afterEach( async () => {
        await Student.deleteMany( {} );
        await Class.deleteMany( {} );
        const { Class: c, Student: s } = await createTestData();
        className = c.name;
        await DataBase.addChanges( c.name, content1 );
        await DataBase.addChanges( c.name, content2 );
    } )

    it( "should return array of changes only without given change", async () => {
        const updateChanges = await DataBase.removeChanges( className, chId1 );

        expect( updateChanges.length ).toBe( 1 );

        expect( updateChanges.find( ch => ch._id.toString() === chId2.toString() ) ).toBeDefined();
    } )
} )

describe( "updateChanges", () => {
    describe( "removeChanges", () => {
        const content1 = {
            attachments: [ "photo111_111_as41" ],
            text: "changes1"
        };
        const content2 = {
            attachments: [ "photo222_222_as41" ],
            text: "changes2"
        };
        let chId1;
        let chId2;
        let className;
        let vkId;

        beforeAll( async () => {
            const { Class: c, Student: s } = await createTestData();
            className = c.name;
            chId1 = await DataBase.addChanges( c.name, content1 );
            chId2 = await DataBase.addChanges( c.name, content2 );
            vkId = s.vkId;
        } );
        afterAll( async () => {
            await Class.deleteMany( {} );
            await Student.deleteMany( {} );
        } )
        afterEach( async () => {
            await Student.deleteMany( {} );
            await Class.deleteMany( {} );
            const { Class: c, Student: s } = await createTestData();
            className = c.name;
            chId1 = await DataBase.addChanges( c.name, content1 );
            chId2 = await DataBase.addChanges( c.name, content2 );
        } )

        it( "should return array of updated changes", async () => {
            const updateChanges = await DataBase.updateChange( className, chId1, { text: "new text" } );

            expect( updateChanges.length ).toBe( 2 );

            expect( updateChanges.find( ch => ch._id.toString() === chId1.toString() ) ).toBeDefined();
            expect( updateChanges.find( ch => ch._id.toString() === chId2.toString() ) ).toBeDefined();
        } )

        it( "should updated change with given id", async () => {
            const updateChange = await DataBase.updateChange( className, chId1, { text: "new text" } );
            expect( updateChange.find( ch => ch._id.toString() === chId1.toString() ).text ).toBe( "new text" );
        } )

        it( "should not update other changes", async () => {
            const textBeforeUpdate = ( await DataBase.getClassByName( className ) ).changes.find( ch => ch._id.toString() === chId2.toString() ).text;
            const updateChange = await DataBase.updateChange( className, chId1, { text: "new text" } );

            expect( updateChange.find( ch => ch._id.toString() === chId2.toString() ).text ).toEqual( textBeforeUpdate );
        } )
    } )
} )