/*
 * Copyright 2020 SkillTree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Utils from "./Utils";

const homePage = '/angular/reportSkills'

context('Angular Tests', () => {

    it('level component should be reactive', () => {
        cy.createDefaultProject()
        const sendEventViaDropdownId = '#PureJSReportAnySkill';
        Cypress.Commands.add("clickSubmit", () => {
            cy.get(`${sendEventViaDropdownId} .btn`).contains('Report Skill').click()
        })
        Cypress.Commands.add("selectSkill", (skill) => {
            cy.get('[data-cy=anySkillDropDownButton]').click()
            cy.get('[data-cy=anySkillDropDownItemButton]').contains(skill).click()//.select(`${skill}`)
        })

        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.selectSkill('IronMan')
        cy.clickSubmit()
        cy.contains('Level 1')

        cy.selectSkill('Thor')
        cy.clickSubmit()
        cy.contains('Level 2')

        cy.selectSkill('subj1_skill0')
        cy.clickSubmit()
        cy.contains('Level 3')

        cy.selectSkill('subj1_skill1')
        cy.clickSubmit()
        cy.contains('Level 3')

        cy.selectSkill('subj2_skill0')
        cy.clickSubmit()
        cy.contains('Level 4')

        cy.selectSkill('subj2_skill1')
        cy.clickSubmit()
        cy.contains('Level 5')
    })

    it('level component should load initial level', () => {
        cy.createDefaultProject()
        // cy.reportSkill('subj1_skill0')

        // this will increment levels for skills@skills.org but Level and display components display data for the proxyUser
        // validate that level is still 0
        cy.reportSkillForUser('IronMan', 'skills@skill.org')
        cy.visitHomePage(homePage);
        cy.contains('Level 0')


        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))
        cy.visitHomePage(homePage);
        cy.contains('Level 1')
    })

    it('level component should be reactive (skills reported directly to backend endpoint)', () => {
        cy.createDefaultProject()
        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))
        cy.contains('Level 1')

        cy.reportSkillForUser('Thor', Cypress.env('proxyUser'))
        cy.contains('Level 2')

        cy.reportSkillForUser('subj1_skill0', Cypress.env('proxyUser'))
        cy.contains('Level 3')

        cy.reportSkillForUser('subj1_skill1', Cypress.env('proxyUser'))
        cy.contains('Level 3')

        cy.reportSkillForUser('subj2_skill0', Cypress.env('proxyUser'))
        cy.contains('Level 4')

        cy.reportSkillForUser('subj2_skill1', Cypress.env('proxyUser'))
        cy.contains('Level 5')
    })

    it('global event show correct results', () => {
        cy.createDefaultProject()
        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))

        cy.contains('Level 1')
        cy.get('[data-cy=globalEventResult]').contains('"skillId": "IronMan"')
        cy.get('[data-cy=globalEventResult]').contains('"pointsEarned": 50')
        cy.get('[data-cy=globalEventResult]').contains('"skillApplied": true')
        cy.get('[data-cy=globalEventResult]').contains(/completed": [[][^]*"type": "Overall",[^]\s*"level": 1/)
    })

    it('global event does not update when skill reported for a different project', () => {
        cy.createDefaultProject()
        cy.createDefaultTinyProject('proj2')
        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'), 'proj2')

        cy.contains('Level 0')
        cy.get('[data-cy=globalEventResult]').should('be.empty');
    })

    it('global event is not reported when skill is not applied', () => {
        cy.createDefaultProject()
        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))

        cy.visitHomePage(homePage);

        cy.contains('Level 1')

        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))
        cy.contains('Level 1')

        cy.get('[data-cy=globalEventResult]').should('be.empty');
    })

    it('level component should not update when admin reports skill for other user', () => {

        cy.createDefaultProject()
        Cypress.Commands.add("reportSkill", (skillId) => {
            cy.backendPost(`/api/projects/proj1/skills/${skillId}`)
        })
        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.reportSkillForUser('IronMan', 'unknown@skills.org')
        cy.contains('Level 0')
    })

    it('skilltree directive on click', () => {
        cy.createDefaultProject(1, 2, 50, 2)

        cy.server().route('POST', '/api/projects/proj1/skills/IronMan').as('postSkill')

        cy.visitHomePage(homePage);

        Cypress.Commands.add("clickOnDirectiveBtn", (skillApplied = true) => {
            cy.get('#SkillsDirectiveClickEvent button').click()
            cy.wait('@postSkill')
            cy.get('@postSkill').then((xhr) => {
                expect(xhr.status).to.eq(200)
                expect(xhr.responseBody).to.have.property('skillApplied').to.eq(skillApplied)
            });
        })

        cy.clickOnDirectiveBtn()
        cy.clickOnDirectiveBtn()
        cy.clickOnDirectiveBtn(false)
    })


    it('skilltree directive on input', () => {
        cy.createDefaultProject(1, 2, 50, 2)
        cy.server().route('POST', '/api/projects/proj1/skills/Thor').as('postSkill')

        cy.visitHomePage(homePage);

        Cypress.Commands.add("typeToInput", (skillApplied = true) => {
            cy.get('#SkillsDirectiveInputEvent input').type('h')
            cy.wait('@postSkill')
            cy.get('@postSkill').then((xhr) => {
                expect(xhr.status).to.eq(200)
                expect(xhr.responseBody).to.have.property('skillApplied').to.eq(skillApplied)
            });
        })

        cy.typeToInput()
        cy.typeToInput()
        cy.typeToInput(false)
    })

    it('skilltree directive on click with error', () => {
        cy.createDefaultTinyProject()
        cy.server().route('POST', '/api/projects/proj1/skills/DoesNotExist').as('postSkill')

        cy.visitHomePage(homePage);

        cy.get('#SkillsDirectiveErrorwithButton button').click()
        cy.wait('@postSkill');
        cy.get('@postSkill').then((xhr) => {
            expect(xhr.status).to.eq(400)
            expect(xhr.responseBody).to.have.property('explanation').to.eq('Failed to report skill event because skill definition does not exist.')
        });
    })

    it('skilltree directive on input with error', () => {
        cy.createDefaultTinyProject()
        cy.server().route('POST', '/api/projects/proj1/skills/DoesNotExist').as('postSkill')

        cy.visitHomePage(homePage);

        cy.get('#SkillsDirectiveErrorwithInput input').type('h')
        cy.wait('@postSkill');
        cy.get('@postSkill').then((xhr) => {
            expect(xhr.status).to.eq(400)
            expect(xhr.responseBody).to.have.property('explanation').to.eq('Failed to report skill event because skill definition does not exist.')
        });
    })

    it('skill display', () => {
        cy.createDefaultTinyProject()
        cy.server().route(Cypress.env('tokenUrl')).as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})
        cy.visit('/angular/showSkills')
        cy.wait('@getToken')
        cy.wait('@getToken')
        cy.wrapIframe().contains('My Level')
        cy.wrapIframe().contains('50 Points earned Today')
        cy.wrapIframe().contains('Subject 0')

        // verify that there is no background set
        // cypress always validates against rgb
        cy.wrapIframe().find('.skills-page-title-text-color')
            .should('have.css', 'background-color').and('equal', 'rgb(255, 255, 255)');
    })

    it('skill display - summary only', () => {
        cy.createDefaultTinyProject()
        cy.server().route(Cypress.env('tokenUrl')).as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})
        cy.visit('/angular/showSkills?isSummaryOnly=true')
        cy.wait('@getToken')
        cy.wait('@getToken')
        cy.wrapIframe().contains('My Level')
        cy.wrapIframe().contains('50 Points earned Today')
        cy.wrapIframe().contains('Subject 0').should('not.exist')

        // verify that there is no background set
        // cypress always validates against rgb
        cy.wrapIframe().find('.skills-page-title-text-color')
            .should('have.css', 'background-color').and('equal', 'rgb(255, 255, 255)');
    })

    it('skill display - theme', () => {
        cy.createDefaultTinyProject()
        cy.server().route(Cypress.env('tokenUrl')).as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})
        cy.visit('/angular/showSkills?themeName=Dark Blue')
        cy.wait('@getToken')
        cy.wait('@getToken')
        cy.wrapIframe().contains('My Level')
        cy.wrapIframe().contains('50 Points earned Today')
        cy.wrapIframe().contains('Subject 0')

        // verify dark blue background of hex #152E4d
        // cypress always validates against rgb
        cy.wrapIframe().find('.skills-page-title-text-color')
            .should('have.css', 'background-color').and('equal', 'rgb(21, 46, 77)');
    })

    it('skill display - summary only - theme', () => {
        cy.createDefaultTinyProject()
        cy.server().route(Cypress.env('tokenUrl')).as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})
        cy.visit('/angular/showSkills?themeName=Dark Blue&isSummaryOnly=true')
        cy.wait('@getToken')
        cy.wrapIframe().contains('My Level')
        cy.wrapIframe().contains('50 Points earned Today')
        cy.wrapIframe().contains('Subject 0').should('not.exist')

        // verify dark blue background of hex #152E4d
        // cypress always validates against rgb
        cy.wrapIframe().find('.skills-page-title-text-color')
            .should('have.css', 'background-color').and('equal', 'rgb(21, 46, 77)');
    })

    it('client display should display an error if skills service is down', () => {
        cy.createDefaultTinyProject()
        cy.server().route({
            method: 'GET',
            url: '/public/status',
            status: 503, // server is down
            response: {}
        }).as('getStatus')
        cy.visit('/angular/showSkills')
        cy.wait('@getStatus')

        cy.contains('Could NOT reach Skilltree Service')
    });

    it('only display skills up-to the provided version', () => {
        cy.createDefaultTinyProject()
        cy.server().route(Cypress.env('tokenUrl')).as('getToken')
        cy.backendAddSkill('skillv1', 1)
        cy.backendAddSkill('skillv2', 2)
        cy.visit('/angular/showSkills')
        cy.wait('@getToken')
        cy.wait('@getToken')
        cy.wrapIframe().contains('Earn up to 200 points')

        cy.visit('/angular/reportSkills')
        cy.visit('/angular/showSkills?skillsVersion=1')
        cy.wait('@getToken')
        cy.wrapIframe().contains('Earn up to 150 points')

        cy.visit('/angular/reportSkills')
        cy.visit('/angular/showSkills?skillsVersion=0')
        cy.wait('@getToken')
        cy.wrapIframe().contains('Earn up to 100 points')
    });

    it('skillsClientVersion is reported correctly', () => {
        cy.createDefaultProject()
        cy.visit(homePage)

        cy.server().route('POST', '/api/projects/proj1/skillsClientVersion').as('reportClientVersion')

        cy.wait('@reportClientVersion')
        cy.get('@reportClientVersion').then((xhr) => {
            expect(xhr.status).to.eq(200)
            expect(xhr.responseBody).to.have.property('success').to.eq(true)
        });
        cy.get('@reportClientVersion').should((xhr) => {
            expect(xhr.request.body, 'request body').to.have.property('skillsClientVersion').and.to.contain('@skilltree/skills-client-ng-')
        });
    })

})
