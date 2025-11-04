//Menu Mobile
document.addEventListener('DOMContentLoaded', function() {
    var btnMenu = document.querySelector('.btn-menu');
    var menu = document.querySelector('.menu');
    var menuLinks = document.querySelectorAll('.menu a');

    if (btnMenu && menu) {
        //Função para abrir/fechar menu
        function manipularMenu() {
            menu.classList.toggle('show');
            btnMenu.classList.toggle('x');
            document.body.classList.toggle('menu-aberto');
        }

        //Função para fechar menu
        function fecharMenu() {
            menu.classList.remove('show');
            btnMenu.classList.remove('x');
            document.body.classList.remove('menu-aberto');
        }

        //Evento no botão do menu
        btnMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            manipularMenu();
        });

        //Fechar menu ao clicar em um link
        menuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                fecharMenu();
            });
        });

        //Fechar menu ao clicar fora dele
        document.addEventListener('click', function(e) {
            if (menu.classList.contains('show') && 
                !menu.contains(e.target) && 
                !btnMenu.contains(e.target)) {
                fecharMenu();
            }
        });

        //Popup (se existir)
        var fundo = document.querySelector('.fundo');
        var logoPopup = document.querySelector('.popup .logo-popup');
        var textoPopup = document.querySelector('.texto-popup');
        
        if (fundo && logoPopup) {
            // Verificar se o popup está visível ao carregar
            if (!fundo.classList.contains('esconder-popup')) {
                document.body.classList.add('popup-aberto');
                
                // Aguardar o texto aparecer (1.5s) antes de permitir interação
                setTimeout(function() {
                    // Adicionar classe para indicar que está pronto para clicar
                    if (textoPopup) {
                        textoPopup.style.cursor = 'pointer';
                    }
                    if (logoPopup) {
                        logoPopup.style.cursor = 'pointer';
                    }
                }, 1500);
            }
            
            // Fechar popup ao clicar no logo ou texto (com efeito de explosão)
            function iniciarExplosao() {
                // Se não estiver explodindo ainda, iniciar a explosão
                if (!logoPopup.classList.contains('explodindo')) {
                    // Iniciar explosão do logo
                    logoPopup.classList.add('explodindo');
                    
                    // Iniciar zoom out do texto sincronizado (mesma duração: 0.8s)
                    if (textoPopup) {
                        textoPopup.classList.add('saindo');
                    }
                    
                    // Após a animação de explosão e zoom out (0.8s), esconder o popup
                    setTimeout(function() {
                        fundo.classList.add('escondendo');
                        
                        // Após o fade out (0.5s), esconder completamente
                        setTimeout(function() {
                            fundo.classList.add('esconder-popup');
                            document.body.classList.remove('popup-aberto');
                        }, 500);
                    }, 800);
                }
            }
            
            if (logoPopup) {
                logoPopup.addEventListener('click', function (e) {
                    e.preventDefault();
                    iniciarExplosao();
                });
            }
            
            if (textoPopup) {
                textoPopup.addEventListener('click', function (e) {
                    e.preventDefault();
                    iniciarExplosao();
                });
            }
            
            // Observar mudanças no popup (caso seja fechado de outra forma)
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'class') {
                        if (fundo.classList.contains('esconder-popup')) {
                            document.body.classList.remove('popup-aberto');
                        } else {
                            document.body.classList.add('popup-aberto');
                        }
                    }
                });
            });
            
            observer.observe(fundo, { attributes: true });
        }
    }
});

