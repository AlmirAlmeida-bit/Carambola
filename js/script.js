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

        //Popup com GSAP - Loading de Carambolas
        var fundo = document.querySelector('.fundo');
        var textoPopup = document.querySelector('.texto-popup');
        var carambolasContainer = document.querySelector('#carambolasContainer');
        var cliqueProcessando = false; // Variável para prevenir múltiplos cliques
        
        if (fundo && carambolasContainer) {
            // Verificar se o popup está visível ao carregar
            if (!fundo.classList.contains('esconder-popup')) {
                document.body.classList.add('popup-aberto');
                
                // Inicializar animação do loading
                iniciarLoadingCarambolas();
            } else {
                // Se o popup já estiver escondido, inicializar os Swipers imediatamente
                inicializarSwipers();
            }
        }
        
        // Sistema de grid para evitar sobreposições
        var posicoesOcupadas = []; // Array para rastrear posições ocupadas
        
        function iniciarLoadingCarambolas() {
            // Animação da frase no topo
            gsap.to(textoPopup, {
                opacity: 1,
                duration: 1,
                ease: "power2.out",
                delay: 0.3
            });
            
            // Criar carambolas diretamente (imagem já foi ajustada pelo usuário)
            criarCarambolas();
        }
        
        function criarCarambolas() {
            // Limpar posições ocupadas
            posicoesOcupadas = [];
            
            var quantidadeCarambolas = calcularQuantidadeCarambolas();
            var containerWidth = window.innerWidth;
            var containerHeight = window.innerHeight;
            var isDesktop = containerWidth >= 1024;
            var carambolaSize = isDesktop ? 160 : (containerWidth >= 768 ? 80 : 60);
            
            // Área reservada para a frase no topo (20% da altura para garantir distância)
            var areaReservadaTopo = containerHeight * 0.20;
            
            // Criar carambolas
            for (var i = 0; i < quantidadeCarambolas; i++) {
                var carambola = document.createElement('div');
                carambola.className = 'carambola-item';
                carambola.setAttribute('data-index', i);
                
                var img = document.createElement('img');
                img.src = 'img/logo2.png';
                img.alt = 'Carambola';
                carambola.appendChild(img);
                
                // Encontrar posição final sem sobreposição (com espaço mínimo)
                var posicaoFinal = encontrarPosicaoLivre(carambolaSize, containerWidth, containerHeight, areaReservadaTopo, quantidadeCarambolas);
                
                // Registrar posição ocupada
                posicoesOcupadas.push({
                    x: posicaoFinal.x + carambolaSize / 2,
                    y: posicaoFinal.y + carambolaSize / 2
                });
                
                // Posição inicial no topo (aleatória horizontal, distribuída uniformemente)
                var spacing = containerWidth / quantidadeCarambolas;
                var randomX = (i * spacing) + (Math.random() - 0.5) * spacing * 0.8;
                
                // Ajustar limites baseado no tamanho da carambola
                var margin = 20;
                randomX = Math.max(margin, Math.min(randomX, containerWidth - carambolaSize - margin));
                
                carambola.style.left = randomX + 'px';
                carambola.style.top = '-100px';
                
                carambolasContainer.appendChild(carambola);
                
                // Pequeno delay antes de iniciar animação
                setTimeout(function(car, idx, finalPos) {
                    animarQuedaCarambola(car, idx, finalPos);
                }, 50, carambola, i, posicaoFinal);
            }
        }
        
        function calcularQuantidadeCarambolas() {
            var width = window.innerWidth;
            var height = window.innerHeight;
            var area = width * height;
            var isDesktop = width >= 1024;
            
            // Calcular quantidade baseada na área da tela
            if (isDesktop) {
                // Desktop: carambolas maiores, quantidade aumentada para preencher melhor
                // Aproximadamente 1 carambola a cada 20000 pixels (aumentado de 35000)
                var quantidade = Math.floor(area / 20000);
                // Limites para desktop: aumentado para preencher melhor
                quantidade = Math.max(40, Math.min(quantidade, 80));
            } else {
                // Mobile/Tablet: carambolas menores, mais quantidade
                // Aproximadamente 1 carambola a cada 8000 pixels (aumentado de 12000)
                var quantidade = Math.floor(area / 8000);
                // Limites para mobile: aumentado
                quantidade = Math.max(30, Math.min(quantidade, 70));
            }
            
            return quantidade;
        }
        
        function verificarSobreposicao(centroX, centroY, size, espacoMinimo) {
            // Espaço mínimo entre carambolas (não podem encostar)
            espacoMinimo = espacoMinimo || (size * 1.1); // 10% de espaço adicional (não encostam)
            
            for (var i = 0; i < posicoesOcupadas.length; i++) {
                var pos = posicoesOcupadas[i];
                var distancia = Math.sqrt(
                    Math.pow(centroX - pos.x, 2) + Math.pow(centroY - pos.y, 2)
                );
                
                // Se a distância entre os centros for menor que o tamanho + espaço mínimo, há sobreposição
                // Distância mínima = size * 1.1 (pequeno espaço entre elas)
                if (distancia < espacoMinimo) {
                    return true;
                }
            }
            return false;
        }
        
        function encontrarPosicaoLivre(size, containerWidth, containerHeight, areaReservadaTopo, quantidadeTotal) {
            var maxTentativas = 300; // Mais tentativas para melhor distribuição
            var tentativas = 0;
            var x, y, centroX, centroY;
            var margin = 15;
            
            // Área disponível - desde a área reservada até o chão (parte inferior)
            var areaDisponivelX = containerWidth - margin * 2 - size;
            // Permitir que caiam até o chão (containerHeight - size - margin)
            var chao = containerHeight - size - margin;
            var areaDisponivelY = chao - areaReservadaTopo - margin;
            
            // Espaço mínimo entre carambolas (10% do tamanho)
            var espacoMinimo = size * 1.1;
            
            while (tentativas < maxTentativas) {
                // Distribuir melhor: primeiro tentar posições mais distribuídas
                if (tentativas < 50 && quantidadeTotal) {
                    // Primeiras 50 tentativas: distribuir uniformemente em grid
                    var gridCols = Math.floor(Math.sqrt(quantidadeTotal) * 1.5);
                    var gridRows = Math.ceil(quantidadeTotal / gridCols);
                    var col = tentativas % gridCols;
                    var row = Math.floor(tentativas / gridCols);
                    
                    if (gridCols > 1 && gridRows > 1) {
                        x = margin + (col / (gridCols - 1)) * areaDisponivelX + (Math.random() - 0.5) * (areaDisponivelX / gridCols * 0.5);
                        y = areaReservadaTopo + margin + (row / (gridRows - 1)) * areaDisponivelY + (Math.random() - 0.5) * (areaDisponivelY / gridRows * 0.5);
                    } else {
                        // Fallback se grid não funcionar
                        x = margin + Math.random() * areaDisponivelX;
                        y = areaReservadaTopo + margin + Math.random() * areaDisponivelY;
                    }
                } else {
                    // Tentativas aleatórias
                    x = margin + Math.random() * areaDisponivelX;
                    y = areaReservadaTopo + margin + Math.random() * areaDisponivelY;
                }
                
                // Garantir que não saia dos limites
                x = Math.max(margin, Math.min(x, containerWidth - size - margin));
                y = Math.max(areaReservadaTopo + margin, Math.min(y, chao));
                
                // Calcular centro
                centroX = x + size / 2;
                centroY = y + size / 2;
                
                // Verificar se não sobrepõe (com espaço mínimo)
                if (!verificarSobreposicao(centroX, centroY, size, espacoMinimo)) {
                    return { x: x, y: y };
                }
                
                tentativas++;
            }
            
            // Se não encontrou posição livre, usar grid
            return encontrarPosicaoGrid(size, containerWidth, containerHeight, areaReservadaTopo, espacoMinimo);
        }
        
        function encontrarPosicaoGrid(size, containerWidth, containerHeight, areaReservadaTopo, espacoMinimo) {
            var margin = 15;
            var spacing = size * 1.15; // Espaçamento com espaço mínimo (15% maior que o tamanho)
            
            // Calcular chão (parte inferior da tela)
            var chao = containerHeight - size - margin;
            
            var colunas = Math.floor((containerWidth - margin * 2) / spacing);
            var linhas = Math.floor((chao - areaReservadaTopo - margin) / spacing);
            
            // Criar array de posições disponíveis
            var posicoesDisponiveis = [];
            for (var linha = 0; linha < linhas; linha++) {
                for (var col = 0; col < colunas; col++) {
                    var x = margin + col * spacing + (spacing - size) / 2;
                    var y = areaReservadaTopo + margin + linha * spacing + (spacing - size) / 2;
                    
                    // Garantir que não ultrapasse o chão
                    if (y + size > chao) {
                        y = chao - size;
                    }
                    
                    var centroX = x + size / 2;
                    var centroY = y + size / 2;
                    
                    if (!verificarSobreposicao(centroX, centroY, size, espacoMinimo)) {
                        posicoesDisponiveis.push({ x: x, y: y });
                    }
                }
            }
            
            // Se há posições disponíveis, retornar uma aleatória
            if (posicoesDisponiveis.length > 0) {
                return posicoesDisponiveis[Math.floor(Math.random() * posicoesDisponiveis.length)];
            }
            
            // Fallback: posição aleatória até o chão
            return {
                x: margin + Math.random() * (containerWidth - size - margin * 2),
                y: areaReservadaTopo + margin + Math.random() * (chao - areaReservadaTopo - margin)
            };
        }
        
        function animarQuedaCarambola(carambola, index, posicaoFinal) {
            var containerHeight = window.innerHeight;
            var containerWidth = window.innerWidth;
            var startX = parseFloat(carambola.style.left);
            var randomDelay = Math.random() * 1.2; // Delay aleatório até 1.2 segundos
            var randomDuration = 1.2 + Math.random() * 2.0; // Duração entre 1.2 e 3.2 segundos
            var randomRotation = (Math.random() - 0.5) * 540; // Rotação aleatória (até 1.5 voltas)
            
            // Usar a posição final calculada (que já garante distribuição e espaço)
            var finalX = posicaoFinal.x;
            var finalY = posicaoFinal.y;
            
            // Pequena variação aleatória na posição final (máximo 5% do tamanho)
            var isDesktop = containerWidth >= 1024;
            var carambolaSize = isDesktop ? 160 : (containerWidth >= 768 ? 80 : 60);
            var variacaoMax = carambolaSize * 0.05; // Máximo 5% de variação
            
            finalX = finalX + (Math.random() - 0.5) * variacaoMax;
            finalY = finalY + (Math.random() - 0.5) * variacaoMax;
            
            // Garantir limites
            var margin = 15;
            var areaReservadaTopo = containerHeight * 0.20;
            var chao = containerHeight - carambolaSize - margin;
            
            finalX = Math.max(margin, Math.min(finalX, containerWidth - carambolaSize - margin));
            finalY = Math.max(areaReservadaTopo + margin, Math.min(finalY, chao));
            
            // Calcular diferença de posição
            var deltaX = finalX - startX;
            var deltaY = finalY - (-100); // Posição inicial é -100px
            
            // Definir posição inicial usando transform
            gsap.set(carambola, {
                x: 0,
                y: -100,
                rotation: 0,
                transformOrigin: "50% 50%"
            });
            
            // Animação principal de queda
            var tl = gsap.timeline({
                delay: randomDelay
            });
            
            // Fade in
            tl.to(carambola, {
                opacity: 1,
                duration: 0.3,
                ease: "power1.out"
            })
            // Movimento para posição final com rotação
            .to(carambola, {
                x: deltaX,
                y: deltaY,
                rotation: randomRotation,
                duration: randomDuration,
                ease: "power1.in",
                onComplete: function() {
                    // Efeito gelatina ao tocar
                    aplicarEfeitoGelatina(carambola);
                }
            });
        }
        
        
        function aplicarEfeitoGelatina(carambola) {
            // Efeito gelatina usando GSAP (jelly bounce)
            var tl = gsap.timeline();
            
            // Primeira compressão (queda)
            tl.to(carambola, {
                scaleY: 0.7,
                scaleX: 1.3,
                duration: 0.15,
                ease: "power2.out"
            })
            // Expansão (rebote)
            .to(carambola, {
                scaleY: 1.2,
                scaleX: 0.85,
                duration: 0.2,
                ease: "power2.out"
            })
            // Segunda compressão (oscilação)
            .to(carambola, {
                scaleY: 0.9,
                scaleX: 1.1,
                duration: 0.15,
                ease: "power2.out"
            })
            // Expansão menor
            .to(carambola, {
                scaleY: 1.05,
                scaleX: 0.95,
                duration: 0.1,
                ease: "power2.out"
            })
            // Volta ao normal
            .to(carambola, {
                scaleY: 1,
                scaleX: 1,
                duration: 0.1,
                ease: "power2.out"
            });
        }
        
        // Fechar popup ao clicar em qualquer carambola
            function iniciarFadeOut() {
            // Prevenir execução múltipla
            if (cliqueProcessando) {
                return;
            }
            cliqueProcessando = true;
            
            if (!fundo || fundo.classList.contains('escondendo')) {
                return;
            }
            
            // Marcar como escondendo imediatamente para prevenir cliques múltiplos
            fundo.classList.add('escondendo');
            
            // Desabilitar pointer events no container imediatamente
            if (carambolasContainer) {
                carambolasContainer.style.pointerEvents = 'none';
            }
            
            // Fade out rápido do texto
                    if (textoPopup) {
                        textoPopup.classList.add('desaparecendo');
                    }
                    
            // Fade out rápido e otimizado - animar apenas o container
            if (carambolasContainer) {
                // Usar requestAnimationFrame para melhor performance
                requestAnimationFrame(function() {
                    gsap.to(carambolasContainer, {
                        opacity: 0,
                        scale: 0.95,
                        duration: 0.25,
                        ease: "power2.in",
                        onComplete: function() {
                            // Esconder completamente
                            fundo.classList.add('esconder-popup');
                            document.body.classList.remove('popup-aberto');
                            
                            // Limpar container para liberar memória imediatamente
                            carambolasContainer.innerHTML = '';
                            
                            // Inicializar Swipers imediatamente sem delay
                            inicializarSwipers();
                        }
                    });
                });
            } else {
                // Fallback rápido se o container não existir
                fundo.classList.add('esconder-popup');
                document.body.classList.remove('popup-aberto');
                inicializarSwipers();
            }
        }
            
        // Adicionar evento de clique nas carambolas (delegation)
        if (carambolasContainer) {
            carambolasContainer.addEventListener('click', function(e) {
                if (e.target.closest('.carambola-item')) {
                    iniciarFadeOut();
                }
                });
            }
            
        // Observar mudanças no popup
        if (fundo) {
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
        
        // Função para carregar vídeo apenas quando necessário (lazy loading)
        function carregarVideo(videoElement, videoSrc) {
            // Se já tem src, não precisa carregar novamente
            if (videoElement.src && videoElement.src.includes(videoSrc)) {
                videoElement.play().catch(function(e) {
                    console.log('Erro ao reproduzir vídeo:', e);
                });
                return;
            }
            
            // Criar source element
            var source = document.createElement('source');
            source.src = videoSrc;
            source.type = 'video/mp4';
            
            // Limpar sources anteriores
            videoElement.innerHTML = '';
            videoElement.appendChild(source);
            
            // Tratamento de erro
            videoElement.addEventListener('error', function() {
                console.log('Vídeo não pôde ser carregado:', videoSrc);
                // Usar poster como fallback
                this.style.display = 'none';
                var banner = this.closest('.banner');
                if (banner && this.poster) {
                    banner.style.backgroundImage = 'url(' + this.poster + ')';
                    banner.style.backgroundSize = 'cover';
                    banner.style.backgroundPosition = 'center';
                }
            }, { once: true });
            
            // Quando vídeo carregar dados suficientes, reproduzir
            videoElement.addEventListener('loadeddata', function() {
                this.play().catch(function(e) {
                    console.log('Erro ao reproduzir vídeo após carregar:', e);
                });
            }, { once: true });
            
            // Carregar vídeo
            videoElement.load();
        }
        
        // Inicializar Swiper principal
        var swiperElement = document.querySelector(".mySwiper");
        if (swiperElement) {
            var swiper = new Swiper(".mySwiper", {
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                autoplay: {
                    delay: 5000, // Aumentado para 5s (vídeos precisam de mais tempo)
                    disableOnInteraction: false,
                },
                effect: 'fade', // Transição suave entre vídeos
                fadeEffect: {
                    crossFade: true
                },
                speed: 1000, // Transição de 1 segundo
                preloadImages: true,
                updateOnWindowResize: true,
                on: {
                    init: function() {
                        // Carregar apenas o vídeo do primeiro slide
                        var firstVideo = swiperElement.querySelector('.swiper-slide-active .banner-video');
                        if (firstVideo && firstVideo.dataset.video) {
                            carregarVideo(firstVideo, firstVideo.dataset.video);
                        }
                    },
                    slideChange: function() {
                        // Pausar todos os vídeos
                        var videos = swiperElement.querySelectorAll('.banner-video');
                        videos.forEach(function(video) {
                            if (!video.paused) {
                                video.pause();
                                video.currentTime = 0;
                            }
                        });
                        
                        // Carregar e reproduzir vídeo do slide ativo
                        var activeVideo = swiperElement.querySelector('.swiper-slide-active .banner-video');
                        if (activeVideo && activeVideo.dataset.video) {
                            // Se o vídeo já foi carregado, apenas reproduzir
                            if (activeVideo.src) {
                                setTimeout(function() {
                                    activeVideo.play().catch(function(e) {
                                        console.log('Erro ao reproduzir vídeo:', e);
                                    });
                                }, 300);
                            } else {
                                // Se não foi carregado, carregar primeiro
                                carregarVideo(activeVideo, activeVideo.dataset.video);
                            }
                        }
                    }
                }
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

