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
            } else {
                // Se o popup já estiver escondido, inicializar os Swipers imediatamente
                inicializarSwipers();
            }
            
            // Fechar popup ao clicar no logo ou texto (com efeito de fade)
            function iniciarFadeOut() {
                // Se não estiver desaparecendo ainda, iniciar o fade out
                if (!logoPopup.classList.contains('desaparecendo')) {
                    // Iniciar fade out do logo e texto simultaneamente
                    logoPopup.classList.add('desaparecendo');
                    
                    if (textoPopup) {
                        textoPopup.classList.add('desaparecendo');
                    }
                    
                    // Após o fade out (0.6s), esconder o popup e revelar a aplicação
                    setTimeout(function() {
                        fundo.classList.add('escondendo');
                        
                        // Após o fade out do fundo (0.5s), esconder completamente e inicializar Swipers
                        setTimeout(function() {
                            fundo.classList.add('esconder-popup');
                            document.body.classList.remove('popup-aberto');
                            
                            // Inicializar Swipers apenas após o popup ser fechado
                            inicializarSwipers();
                        }, 500);
                    }, 600);
                }
            }
            
            if (logoPopup) {
                logoPopup.addEventListener('click', function (e) {
                    e.preventDefault();
                    iniciarFadeOut();
                });
            }
            
            if (textoPopup) {
                textoPopup.addEventListener('click', function (e) {
                    e.preventDefault();
                    iniciarFadeOut();
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
    
    // Função para inicializar os Swipers (apenas após popup ser fechado)
    var swipersInicializados = false;
    function inicializarSwipers() {
        if (swipersInicializados) {
            return; // Já foram inicializados
        }
        
        swipersInicializados = true;
        
        // Scroll para o topo
        window.scrollTo(0, 0);
        
        // Inicializar Swiper principal
        var swiperElement = document.querySelector(".mySwiper");
        if (swiperElement) {
            var swiper = new Swiper(".mySwiper", {
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                autoplay: {
                    delay: 2500,
                    disableOnInteraction: false,
                },
                preloadImages: true,
                updateOnWindowResize: true,
            });
            
            // Mostrar o Swiper após inicialização
            swiperElement.classList.add('swiper-inicializado');
        }
        
        // Inicializar Swiper de Clientes
        var clientesSwiperElement = document.querySelector(".clientes-swiper");
        if (clientesSwiperElement) {
            var clientesSwiper = new Swiper(".clientes-swiper", {
                navigation: {
                    nextEl: ".clientes-swiper .swiper-button-next",
                    prevEl: ".clientes-swiper .swiper-button-prev",
                },
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                preloadImages: true,
                updateOnWindowResize: true,
            });
        }
    }
});

