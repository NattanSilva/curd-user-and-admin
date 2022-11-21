# Express: CRUD de usuário + permissão de administrador

Para inciar este projeto, é necessário instalar as dependências, que serão utilizadas nos testes. Portanto utilize o comando abaixo para instalar tais dependências:

````
yarn install
````


**Atenção:** é necessário utilizar o `yarn` pois esse projeto foi iniciado com esse gerenciador de pacotes.

Para verificar se já possui o gerenciador yarn instalado utilize o seguinte comando:

````
yarn --version
````

Caso não possua o yarn instalado, utilize o comando abaixo para instalar globalmente na sua máquina:

````
npm install --global yarn
````
# **Sobre os testes**

Essa aplicação possui testes, que serão utilizados para validar, se todas as regras de negócio foram aplicadas de maneira correta.

Os testes estão localizados em `src/test/user.spec.js`. 

**De modo algum altere esse arquivo.** Isso poderá comprometer a integridade dos testes.

Além disso, é importante não alterar o arquivo `.babelrc`. (não se preocupe em saber para que serve isso por enquanto).

E também não altere o script de `test` localizado no `package.json`. Isso será utilizado para rodar os testes.


# **Rodando os testes** 

Para rodar os testes é necessário que no seu terminal, você esteja dentro do diretório do projeto.

Estando no terminal e dentro do caminho correto, você deverá utilizar o seguinte comando:

````
yarn test
````
caso seja necessário um log mais completo, utilize o comando:
````
yarn test --all
````
Após isso aparecerá um log no seu terminal, contendo as informações da execução do teste.

**Observação:** O teste pode demorar alguns segundos para ser finalizado.

O seu objetivo é que a mensagem nesse log se pareça com essa:
`````
yarn run v1.22.18
$ jest --all
  console.log
    Server is running on http://localhost:3000

      at Server.log (src/app.js:10:32)

 PASS  src/test/user.spec.js
  Testing success cases in the routes
    √ Testando criação de usuário com um corpo correto (142 ms)                                                                                                    
    √ Testando criação de usuário com e-mail já utilizado (4 ms)                                                                                                   
    √ Testando login válido (71 ms)                                                                                                                                
    √ Testando login inválido (68 ms)                                                                                                                              
    √ Testando listagem de usuários (73 ms)                                                                                                                        
    √ Testando listagem de usuários sem token (3 ms)                                                                                                               
    √ Testando listagem de usuários sem autorização (144 ms)                                                                                                       
    √ Testando listagem do perfil de usuário (73 ms)                                                                                                               
    √ Testando listagem do perfil de usuário (3 ms)                                                                                                                
    √ Testando atualização sem token (73 ms)                                                                                                                       
    √ Testando atualização do próprio usuário sem permissão de ADM (75 ms)                                                                                         
    √ Testando atualização de outro usuário sem permissão de ADM (141 ms)                                                                                          
    √ Testando atualização de qualquer usuário com permissão de ADM (134 ms)                                                                                       
    √ Testando deleção sem token (70 ms)                                                                                                                           
    √ Testando deleção de outro usuário sem permissão de ADM (143 ms)                                                                                              
    √ Testando deleção de outro usuário com permissão de ADM (137 ms)                                                                                              
    √ Testando deleção do próprio usuário (75 ms)                                                                                                                  
                                                                                                                                                                   
Test Suites: 1 passed, 1 total                                                                                                                                     
Tests:       17 passed, 17 total                                                                                                                                   
Snapshots:   0 total
Time:        1.957 s, estimated 3 s
Ran all test suites.
Jest did not exit one second after the test run has completed.

This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
`````
# **Entendendo o log**

### Aqui vão algumas explicações sobre cada componente da saída do seu teste:
- `PASS  src/test/user.spec.js`: Essa linha mostra que todos os testes, contidos no arquivo especificado, foram executados com êxito;
- `Testing success cases in the routes`: aqui é dado uma lista com parte ou todos os testes executados;
    ````
    √ Testando criação de usuário com um corpo correto (151 ms)                                                                                                    
    √ Testando criação de usuário com e-mail já utilizado (7 ms)                                                                                                   
    √ Testando login válido (76 ms)                                                                                                                                
    √ Testando login inválido (77 ms)                                                                                                                              
    √ Testando listagem de usuários (91 ms)                                                                                                                        
    √ Testando listagem de usuários sem token (2 ms)                                                                                                               
    √ Testando listagem de usuários sem autorização (147 ms)
    ````
- `Test Suites: 1 passed, 1 total`: aqui estão a quantidade de blocos de testes executados e quantos desses blocos passaram ou falharam nos testes;
- `Tests: 17 passed, 17`: nessa linha estão a quantidade total de testes executados, assim como quantos falharam ou tiveram sucesso;
##
Caso o seu teste **falhe**, você reberá `FAIL  src/test/user.spec.js` ao invés de `PASS  src/test/user.spec.js`.

Para um feedback mais preciso olhe para a lista de testes executados busque pelo erro específico.

***O teste que falhou irá aparecer com um `x` ao invés de um `√`.***

E logo abaixo da lista de testes executados irá aparecer uma ou mais mensagens, com o que era esperado (Expected) e com o que foi recebido de fato (Received).

`````
 FAIL  src/test/user.spec.js
  Testing success cases in the routes
    √ Testando criação de usuário com um corpo correto (150 ms)                                                                                                    
    √ Testando criação de usuário com e-mail já utilizado (4 ms)                                                                                                   
    √ Testando login válido (4 ms)                                                                                                                                 
    × Testando login inválido (4 ms)                                                                                                                               
    √ Testando listagem de usuários (6 ms)                                                                                                                         
    √ Testando listagem de usuários sem token (3 ms)                                                                                                               
    √ Testando listagem de usuários sem autorização (80 ms)                                                                                                        
                                                                                                                                                                   
  ● Testing success cases in the routes › Testando login inválido                                                                                                  
                                                                                                                                                                   
    expect(received).toBe(expected) // Object.is equality

    Expected: 401
    Received: 200

`````
#
### Agora que já sabe como iniciar o seu projeto, rodar os testes e lê-los, é hora de colocar a mão no código!
