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

const homePage = '/react/index.html#/'

context('React Tests', () => {
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

    it('level component should load initial level', () => {
        cy.createDefaultProject()
        // cy.reportSkill('subj1_skill0')

        // this will increment levels for the default user = skills@skills.org but Level and display components display data for Cypress.env('proxyUser')
        // validate that level is still 0
        cy.reportSkillForUser('IronMan', 'skills@skill.org')
        cy.visitHomePage(homePage);
        cy.contains('Level 0')


        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))
        cy.visitHomePage(homePage);
        cy.contains('Level 1')
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

    it('level component should be reactive', () => {
        cy.createDefaultProject()
        const sendEventViaDropdownId = '#exampleDirectiveClickEvent';
        Cypress.Commands.add("clickSubmit", () => {
            cy.get(`${sendEventViaDropdownId} .btn`).click()
        })
        Cypress.Commands.add("selectSkill", (skill) => {
            cy.get(`${sendEventViaDropdownId} select`).select(`${skill}`)
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

    it('global event does not update when skill reported for a different project', () => {
        cy.createDefaultProject()
        cy.createDefaultTinyProject('proj2')
        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'), 'proj2')

        cy.contains('Level 0')
        cy.get('[data-cy=globalEventResult]').should('be.empty');
    })

    it('level component should not update when admin reports skill for other user', () => {
        cy.createDefaultProject()
        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.reportSkillForUser('IronMan', 'unknown@skills.org')
        cy.contains('Level 0')
    })

    it('skill display', () => {
        cy.createDefaultTinyProject()
        cy.server().route(Cypress.env('tokenUrl')).as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})
        cy.visit('/react/index.html#/showSkills')
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
        cy.visit('/react/index.html#/showSkills?isSummaryOnly=true')
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
        cy.visit('/react/index.html#/showSkills?themeName=Dark Blue')
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
        cy.visit('/react/index.html#/showSkills?themeName=Dark Blue&isSummaryOnly=true')
        cy.wait('@getToken')
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
        cy.visit('/react/index.html#/showSkills')
        cy.wait('@getStatus')

        cy.contains('Could NOT reach Skilltree Service')
    });

    it('only display skills up-to the provided version', () => {
        cy.createDefaultTinyProject()
        cy.server().route(Cypress.env('tokenUrl')).as('getToken')
        cy.backendAddSkill('skillv1', 1)
        cy.backendAddSkill('skillv2', 2)
        cy.visit('/react/index.html#/showSkills')
        cy.wait('@getToken')
        cy.wait('@getToken')
        cy.wrapIframe().contains('Earn up to 200 points')

        cy.visit('/react/index.html#/')
        cy.visit('/react/index.html#/showSkills?skillsVersion=1')
        cy.wait('@getToken')
        cy.wrapIframe().contains('Earn up to 150 points')

        cy.visit('/react/index.html#/')
        cy.visit('/react/index.html#/showSkills?skillsVersion=0')
        cy.wait('@getToken')
        cy.wrapIframe().contains('Earn up to 100 points')

    });

    it('skillsClientVersion is reported correctly', () => {
        cy.createDefaultProject()
        cy.visit('/react/index.html#/')

        cy.server().route('POST', '/api/projects/proj1/skillsClientVersion').as('reportClientVersion')

        cy.wait('@reportClientVersion')
        cy.get('@reportClientVersion').then((xhr) => {
            expect(xhr.status).to.eq(200)
            expect(xhr.responseBody).to.have.property('success').to.eq(true)
        });
        cy.get('@reportClientVersion').should((xhr) => {
            expect(xhr.request.body, 'request body').to.have.property('skillsClientVersion').and.to.contain('@skilltree/skills-client-react-')
        });
    })
})
