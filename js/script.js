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
        
        // Sistema de física para empilhamento
        var carambolasAtivas = []; // Array para rastrear todas as carambolas ativas {element, x, y, size, finalY}
        var areaReservadaTopo = 0;
        var carambolaSize = 0;
        
        // Função para gerar tamanho aleatório de carambola
        function gerarTamanhoCarambola(isDesktop, tamanhoBase) {
            // Variação de 70% a 130% do tamanho base para variar os tamanhos
            var variacao = 0.7 + Math.random() * 0.6; // Entre 0.7 e 1.3
            var tamanho = Math.floor(tamanhoBase * variacao);
            // Garantir tamanho mínimo e máximo
            if (isDesktop) {
                return Math.max(110, Math.min(tamanho, 210)); // Desktop: entre 110px e 210px
            } else {
                // No mobile, usar limites baseados no tamanhoBase (que agora é maior: 120px ou 140px)
                // Tamanho mínimo: 70% do tamanhoBase, máximo: 130% do tamanhoBase
                var tamanhoMin = Math.floor(tamanhoBase * 0.7);
                var tamanhoMax = Math.floor(tamanhoBase * 1.3);
                return Math.max(tamanhoMin, Math.min(tamanho, tamanhoMax));
                // Exemplo: se tamanhoBase = 120px, então entre 84px e 156px
                // Se tamanhoBase = 140px, então entre 98px e 182px
            }
        }
        
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
            // Limpar carambolas ativas
            carambolasAtivas = [];
            
            if (!carambolasContainer) {
                return;
            }
            
            // Obter dimensões REAIS do container com pequeno delay para garantir renderização
            setTimeout(function() {
                var containerRect = carambolasContainer.getBoundingClientRect();
                var containerWidth = containerRect.width || window.innerWidth;
                var containerHeight = containerRect.height || window.innerHeight;
                
                // Se altura for 0 ou inválida, usar window.innerHeight
                if (!containerHeight || containerHeight === 0 || containerHeight > window.innerHeight * 2) {
                    containerHeight = window.innerHeight;
                }
                
                console.log('Container REAL - Width:', containerWidth, 'Height:', containerHeight);
                console.log('Window - Width:', window.innerWidth, 'Height:', window.innerHeight);
            
            var quantidadeCarambolas = calcularQuantidadeCarambolas();
            var isDesktop = containerWidth >= 1024;
                // No mobile, aumentar muito o tamanho base para que 15 carambolas maiores preencham a tela
                // Mobile pequeno: 120px (aumentado de 90px), Tablet: 140px (aumentado de 110px)
                var tamanhoBase = isDesktop ? 160 : (containerWidth >= 768 ? 140 : 120);
                
                // Área reservada para a frase no topo (parar antes da frase)
                // No mobile: 12% para permitir mais preenchimento com carambolas maiores
                // No desktop: 25% para manter espaço
                var porcentagemAreaReservada = isDesktop ? 0.25 : 0.12;
                areaReservadaTopo = containerHeight * porcentagemAreaReservada;
                
                var margin = 20;
                
                // Calcular chão (começar do chão)
                var marginBottom = isDesktop ? 0 : 15;
                var chao = containerHeight - marginBottom;
                
                console.log('=== CRIANDO CARAMBOLAS ===');
                console.log('Container:', containerWidth, 'x', containerHeight);
                console.log('Área reservada (topo):', areaReservadaTopo);
                console.log('Chão (Y):', chao);
                console.log('Quantidade de carambolas a criar:', quantidadeCarambolas);
                console.log('Tamanho base:', tamanhoBase);
                console.log('Is Desktop:', isDesktop);
            
            // NOVA ABORDAGEM: Preencher de baixo para cima
            // Criar array de carambolas com tamanhos e posições variados
            var carambolasInfo = [];
            
            // Calcular melhor distribuição horizontal para preencher mais espaços
            var larguraDisponivel = containerWidth - margin * 2;
            var tamanhoMedio = tamanhoBase;
            // No mobile com apenas 15 carambolas maiores, reduzir espaçamento para preencher melhor a tela
            // Mas manter espaçamento suficiente para não sobrepor
            var espacoMedioPorCarambola = isDesktop ? (tamanhoMedio * 1.15) : (tamanhoMedio * 1.20); // Mobile: 20% de espaço (reduzido de 25% para preencher melhor com 15 carambolas)
            var carambolasPorLinhaEstimado = Math.floor(larguraDisponivel / espacoMedioPorCarambola);
            
            for (var i = 0; i < quantidadeCarambolas; i++) {
                // Gerar tamanho aleatório para cada carambola
                var tamanhoAtual = gerarTamanhoCarambola(isDesktop, tamanhoBase);
                
                // Distribuição melhorada no mobile - cobrir toda a largura de forma mais uniforme
                var posicaoX;
                
                if (!isDesktop) {
                    // Mobile: distribuição por zonas para melhor cobertura
                    // Dividir a tela em 5 zonas horizontais para distribuição uniforme
                    var numZonas = 5;
                    var larguraZona = larguraDisponivel / numZonas;
                    
                    // Garantir que cada zona receba pelo menos algumas carambolas
                    var zonaAtual = i % numZonas; // Alternar entre as zonas
                    
                    // Adicionar aleatoriedade na escolha da zona (70% na zona calculada, 30% aleatória)
                    if (Math.random() < 0.3) {
                        zonaAtual = Math.floor(Math.random() * numZonas);
                    }
                    
                    // Calcular posição dentro da zona
                    var inicioZona = margin + (zonaAtual * larguraZona);
                    var fimZona = inicioZona + larguraZona;
                    
                    // Posição aleatória dentro da zona, mas garantindo espaço para o tamanho da carambola
                    var espacoNaZona = fimZona - inicioZona - tamanhoAtual;
                    if (espacoNaZona > 0) {
                        posicaoX = inicioZona + Math.random() * espacoNaZona;
                    } else {
                        // Se a zona é muito pequena, colocar no centro da zona
                        posicaoX = inicioZona + (larguraZona - tamanhoAtual) / 2;
                    }
                    
                    // Adicionar pequena variação aleatória para efeito desleixado
                    var variacaoAleatoria = (Math.random() - 0.5) * (tamanhoAtual * 0.2); // Até 20% de variação
                    posicaoX += variacaoAleatoria;
                    
                } else {
                    // Desktop: distribuição totalmente aleatória
                    var espacamentoMinimo = 0;
                    var larguraDisponivelAleatoria = containerWidth - margin * 2 - tamanhoAtual - espacamentoMinimo * 2;
                    posicaoX = margin + espacamentoMinimo + Math.random() * Math.max(0, larguraDisponivelAleatoria);
                    
                    // Adicionar variação extra aleatória
                    var variacaoAleatoria = (Math.random() - 0.5) * (tamanhoAtual * 0.3); // Até 30% de variação
                    posicaoX += variacaoAleatoria;
                }
                
                // Garantir limites gerais (sempre dentro da tela)
                posicaoX = Math.max(margin, Math.min(posicaoX, containerWidth - tamanhoAtual - margin));
                
                carambolasInfo.push({
                    index: i,
                    tamanho: tamanhoAtual,
                    posicaoX: posicaoX
                });
            }
            
            // Embaralhar aleatoriamente para efeito totalmente desleixado (sem ordenação por tamanho)
            carambolasInfo.sort(function() {
                return Math.random() - 0.5; // Embaralhar completamente
            });
            
            // Criar carambolas e calcular posições de baixo para cima
            console.log('Criando', carambolasInfo.length, 'carambolas...');
            
            for (var i = 0; i < carambolasInfo.length; i++) {
                var info = carambolasInfo[i];
                var carambola = document.createElement('div');
                carambola.className = 'carambola-item';
                carambola.setAttribute('data-index', info.index);
                
                var img = document.createElement('img');
                // Escolher aleatoriamente entre logo1.png e logo2.png
                var logoAleatorio = Math.random() < 0.5 ? 'logo1.png' : 'logo2.png';
                img.src = 'img/' + logoAleatorio;
                img.alt = 'Carambola';
                img.onerror = function() {
                    console.error('Erro ao carregar imagem', logoAleatorio);
                    // Tentar o outro logo como fallback
                    if (logoAleatorio === 'logo1.png') {
                        img.src = 'img/logo2.png';
                    } else {
                        img.src = 'img/logo1.png';
                    }
                };
                carambola.appendChild(img);
                
                // Definir tamanho da carambola
                carambola.style.width = info.tamanho + 'px';
                carambola.style.height = info.tamanho + 'px';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                
                carambola.style.left = info.posicaoX + 'px';
                carambola.style.top = '-200px'; // Começar mais acima
                carambola.style.position = 'absolute';
                carambola.style.opacity = '0';
                carambola.style.display = 'block';
                carambola.style.zIndex = '1';
                
                carambolasContainer.appendChild(carambola);
                console.log('Carambola', info.index, 'criada - Tamanho:', info.tamanho, 'X:', info.posicaoX);
                
                // Delay escalonado para efeito pipoca (mais espaçado)
                var delayBase = (i * 120); // Delay maior para efeito pipoca
                var delayAleatorio = delayBase + Math.random() * 150;
                
                // Usar closure para capturar informações
                (function(car, idx, xPos, tamanho, contWidth, contHeight) {
                    setTimeout(function() {
                        console.log('Iniciando animação para carambola', idx, 'após delay de', delayAleatorio, 'ms');
                        animarQuedaCarambolaPipoca(car, idx, xPos, tamanho, contWidth, contHeight);
                    }, delayAleatorio);
                })(carambola, info.index, info.posicaoX, info.tamanho, containerWidth, containerHeight);
            }
            
            console.log('Todas as carambolas foram criadas e agendadas para animação');
            }, 50); // Pequeno delay para garantir que o container foi renderizado
        }
        
        // Nova função: encontrar posição de baixo para cima (preencher espaços vazios)
        function encontrarPosicaoDeBaixoParaCima(posicaoX, carambolaSize, containerHeight, containerWidth) {
            if (!carambolasContainer) {
                return null;
            }
            
            var viewportHeight = window.innerHeight;
            var marginBottom = containerWidth >= 1024 ? 0 : 15;
            var chao = viewportHeight - marginBottom;
            
            // Limite superior (parar antes da frase)
            var limiteSuperior = areaReservadaTopo || (containerHeight * 0.20);
            
            // Se não há área reservada definida, usar um valor padrão
            if (!limiteSuperior || limiteSuperior === 0) {
                limiteSuperior = containerHeight * 0.20;
            }
            
            // Começar do chão e subir procurando espaço
            var raioNova = carambolaSize / 2;
            var centroNova = posicaoX + raioNova;
            
            // Estratégia melhorada: buscar a posição mais baixa disponível sem colisão
            // Começar do chão e subir procurando espaço livre
            var melhorPosicaoY = null;
            var posicaoYTeste = chao - carambolaSize;
            var passo = carambolaSize * 0.3; // Passo menor para melhor detecção
            var tentativasMaximas = 100;
            var tentativas = 0;
            
            // Buscar posição mais baixa disponível (de baixo para cima)
            while (tentativas < tentativasMaximas && posicaoYTeste >= limiteSuperior) {
                var temColisao = false;
                
                // Verificar colisão com todas as carambolas ativas
                for (var i = 0; i < carambolasAtivas.length; i++) {
                    var carAtiva = carambolasAtivas[i];
                    if (!carAtiva || carAtiva.y === undefined || carAtiva.size === undefined) continue;
                    
                    // Verificar se está na mesma altura (linha similar)
                    // No mobile, aumentar tolerância vertical para detectar melhor colisões
                    var toleranciaVertical = containerWidth < 1024 ? (carambolaSize * 0.5) : (carambolaSize * 0.4);
                    var diferencaY = Math.abs(carAtiva.y - posicaoYTeste);
                    if (diferencaY < toleranciaVertical) {
                        // Verificar colisão horizontal
                        var raioAtivo = carAtiva.size / 2;
                        var centroAtivo = carAtiva.x + raioAtivo;
                        var distanciaX = Math.abs(centroAtivo - centroNova);
                        // No mobile com 15 carambolas maiores, ajustar margem para evitar sobreposição mas permitir preenchimento
                        var margemEspacamento = containerWidth < 1024 ? 1.08 : 1.02; // Mobile: 8% de margem (reduzido de 10% para preencher melhor), Desktop: 2%
                        var distanciaMinima = (raioAtivo + raioNova) * margemEspacamento;
                        
                        if (distanciaX < distanciaMinima) {
                            // Há colisão - tentar empilhar em cima desta carambola
                            var novaY = carAtiva.y - carambolaSize;
                            if (novaY >= limiteSuperior && (melhorPosicaoY === null || novaY < melhorPosicaoY)) {
                                melhorPosicaoY = novaY;
                            }
                            temColisao = true;
                            break;
                        }
                    }
                }
                
                if (!temColisao) {
                    // Não há colisão nesta posição - esta é uma boa posição
                    if (melhorPosicaoY === null || posicaoYTeste > melhorPosicaoY) {
                        melhorPosicaoY = posicaoYTeste;
                    }
                    // Continuar procurando mais baixo (maior Y) para encontrar a posição mais baixa possível
                    posicaoYTeste += passo;
                } else {
                    // Há colisão - subir para procurar espaço
                    posicaoYTeste -= passo;
                }
                
                tentativas++;
            }
            
            // Se não encontrou posição, usar o chão como última opção (se não houver colisão)
            if (melhorPosicaoY === null) {
                melhorPosicaoY = chao - carambolaSize;
                
                // Verificar se há colisão no chão
                for (var i = 0; i < carambolasAtivas.length; i++) {
                    var carAtiva = carambolasAtivas[i];
                    if (!carAtiva || carAtiva.y === undefined || carAtiva.size === undefined) continue;
                    
                    // No mobile, aumentar tolerância vertical para detectar melhor colisões
                    var toleranciaVertical = containerWidth < 1024 ? (carambolaSize * 0.5) : (carambolaSize * 0.4);
                    var diferencaY = Math.abs(carAtiva.y - melhorPosicaoY);
                    if (diferencaY < toleranciaVertical) {
                        var raioAtivo = carAtiva.size / 2;
                        var centroAtivo = carAtiva.x + raioAtivo;
                        var distanciaX = Math.abs(centroAtivo - centroNova);
                        // No mobile com 15 carambolas maiores, ajustar margem para evitar sobreposição mas permitir preenchimento
                        var margemEspacamento = containerWidth < 1024 ? 1.08 : 1.02; // Mobile: 8% de margem
                        var distanciaMinima = (raioAtivo + raioNova) * margemEspacamento;
                        
                        if (distanciaX < distanciaMinima) {
                            // Colisão no chão - empilhar em cima
                            melhorPosicaoY = carAtiva.y - carambolaSize;
                        }
                    }
                }
            }
            
            // Validações finais
            // Garantir que não ultrapasse o chão
            if (melhorPosicaoY > chao - carambolaSize) {
                melhorPosicaoY = chao - carambolaSize;
            }
            
            // Garantir que não ultrapasse o limite superior
            if (melhorPosicaoY < limiteSuperior) {
                // Se está muito próximo do limite, não há espaço
                if (melhorPosicaoY < limiteSuperior - carambolaSize * 0.5) {
                    return null;
                }
                // Se está apenas um pouco abaixo, ajustar
                melhorPosicaoY = limiteSuperior;
            }
            
            // Verificação final de colisão na posição escolhida
            for (var i = 0; i < carambolasAtivas.length; i++) {
                var carAtiva = carambolasAtivas[i];
                if (!carAtiva || carAtiva.y === undefined || carAtiva.size === undefined) continue;
                
                // No mobile, aumentar tolerância vertical para detectar melhor colisões
                var toleranciaVertical = containerWidth < 1024 ? (carambolaSize * 0.5) : (carambolaSize * 0.4);
                var diferencaY = Math.abs(carAtiva.y - melhorPosicaoY);
                if (diferencaY < toleranciaVertical) {
                    var raioAtivo = carAtiva.size / 2;
                    var centroAtivo = carAtiva.x + raioAtivo;
                    var distanciaX = Math.abs(centroAtivo - centroNova);
                    // No mobile, aumentar muito a margem para evitar sobreposição
                    var margemEspacamento = containerWidth < 1024 ? 1.15 : 1.02; // Mobile: 15% de margem
                    var distanciaMinima = (raioAtivo + raioNova) * margemEspacamento;
                    
                    if (distanciaX < distanciaMinima) {
                        // Ainda há colisão - empilhar em cima
                        melhorPosicaoY = carAtiva.y - carambolaSize;
                        if (melhorPosicaoY < limiteSuperior - carambolaSize * 0.5) {
                            return null;
                        }
                    }
                }
            }
            
            // Garantir que a posição é válida
            if (melhorPosicaoY < 0 || melhorPosicaoY > chao || isNaN(melhorPosicaoY)) {
                return null;
            }
            
            return melhorPosicaoY;
        }
        
        // Função antiga mantida para compatibilidade (não usada mais)
        function encontrarPosicaoEmpilhamento(posicaoX, carambolaSize, containerHeight, containerWidth) {
            if (!carambolasContainer) {
                return null;
            }
            
            // Usar viewport diretamente para garantir que o chão seja correto
            var viewportHeight = window.innerHeight;
            var marginBottom = containerWidth >= 1024 ? 0 : 15;
            
            // Chão = altura da VIEWPORT - tamanho da carambola - margem inferior
            // Usar viewportHeight para garantir que pare no fundo visível
            var chao = Math.max(0, viewportHeight - carambolaSize - marginBottom);
            
            // Se o container for menor, usar o menor valor
            if (containerHeight && containerHeight < viewportHeight) {
                var chaoContainer = Math.max(0, containerHeight - carambolaSize - marginBottom);
                if (chaoContainer < chao) {
                    chao = chaoContainer;
                }
            }
            
            // Calcular área reservada se não estiver definida
            // No mobile, usar área reservada menor para permitir empilhamento maior
            var isMobile = containerWidth < 1024;
            var porcentagemAreaReservada = isMobile ? 0.10 : 0.20; // 10% no mobile, 20% no desktop
            var areaReservadaCalculada = areaReservadaTopo || (containerHeight ? containerHeight * porcentagemAreaReservada : viewportHeight * porcentagemAreaReservada);
            
            // Adicionar apenas meio espaço para chegar bem perto da frase
            var alturaMeiaLinha = carambolaSize * 0.5; // Meio espaço apenas
            
            // Margem mínima para chegar bem perto da frase
            var margemSuperior = isMobile ? 1 : 2; // Muito reduzido para chegar bem perto
            // Limite superior bem próximo da frase
            var limiteSuperior = areaReservadaCalculada + margemSuperior + alturaMeiaLinha;
            
            // Se não há espaço suficiente entre o limite superior e o chão, usar uma área menor
            var espacoDisponivel = chao - limiteSuperior;
            if (espacoDisponivel < carambolaSize) {
                // Se o espaço disponível é muito pequeno, reduzir a área reservada
                limiteSuperior = Math.max(0, chao - carambolaSize * 3);
                areaReservadaCalculada = limiteSuperior - margemSuperior;
            }
            
            // Detecção de colisão mais rigorosa para evitar sobreposição
            var posicaoYFinal = chao;
            var raioNova = carambolaSize / 2;
            var centroNova = posicaoX + raioNova;
            
            // Primeiro, verificar todas as carambolas para encontrar a posição de empilhamento
            for (var i = 0; i < carambolasAtivas.length; i++) {
                var carAtiva = carambolasAtivas[i];
                if (!carAtiva || carAtiva.y === undefined || carAtiva.size === undefined) continue;
                
                var raioAtivo = carAtiva.size / 2;
                var centroAtivo = carAtiva.x + raioAtivo;
                var distanciaX = Math.abs(centroAtivo - centroNova);
                
                // Distância mínima = soma dos raios (100% - sem margem para evitar sobreposição)
                var distanciaMinima = raioAtivo + raioNova;
                
                // Se há colisão horizontal
                if (distanciaX < distanciaMinima) {
                    // Verificar se está na última linha
                    var diferencaYDoLimite = Math.abs(carAtiva.y - limiteSuperior);
                    var estaNaUltimaLinha = diferencaYDoLimite < carambolaSize * 0.5;
                    
                    if (estaNaUltimaLinha) {
                        // Se a carambola ativa está na última linha e há colisão, 
                        // a nova carambola DEVE empilhar em cima (nunca na mesma linha)
                        var novaPosicaoY = carAtiva.y - carambolaSize;
                        if (novaPosicaoY < posicaoYFinal && novaPosicaoY >= limiteSuperior) {
                            posicaoYFinal = novaPosicaoY;
                        }
                    } else {
                        // Carambola ativa não está na última linha - pode empilhar normalmente
                        var novaPosicaoY = carAtiva.y - carambolaSize;
                        if (novaPosicaoY < posicaoYFinal && novaPosicaoY >= limiteSuperior) {
                            posicaoYFinal = novaPosicaoY;
                        }
                    }
                }
            }
            
            // VALIDAÇÃO ABSOLUTA: nunca pode ultrapassar o chão
            if (posicaoYFinal > chao) {
                posicaoYFinal = chao;
            }
            
            // Garantir que não seja negativo
            if (posicaoYFinal < 0) {
                posicaoYFinal = 0;
            }
            
            // Validação crítica da última linha: garantir ZERO sobreposição
            var diferencaYDoLimite = Math.abs(posicaoYFinal - limiteSuperior);
            var estaNaUltimaLinha = diferencaYDoLimite < carambolaSize * 0.6; // Considerar última linha se estiver próximo
            
            // Se a carambola final está na última linha, verificar colisões rigorosamente
            if (estaNaUltimaLinha || posicaoYFinal < limiteSuperior + carambolaSize) {
                // Verificar TODAS as carambolas na última linha para evitar sobreposição
                var temSobreposicaoNaUltimaLinha = false;
                
                for (var k = 0; k < carambolasAtivas.length; k++) {
                    var carAtiva = carambolasAtivas[k];
                    if (!carAtiva || carAtiva.y === undefined || carAtiva.size === undefined) continue;
                    
                    // Verificar se está na última linha (mesma altura Y)
                    var diferencaYCarAtiva = Math.abs(carAtiva.y - limiteSuperior);
                    var carAtivaNaUltimaLinha = diferencaYCarAtiva < carambolaSize * 0.6;
                    
                    if (carAtivaNaUltimaLinha) {
                        // Está na última linha - verificar colisão horizontal EXATA
                        var raioAtivo = carAtiva.size / 2;
                        var centroAtivo = carAtiva.x + raioAtivo;
                        var distanciaX = Math.abs(centroAtivo - centroNova);
                        var distanciaMinimaExata = raioAtivo + raioNova; // 100% - zero tolerância
                        
                        // Se a distância for menor que a soma dos raios, há sobreposição
                        if (distanciaX < distanciaMinimaExata) {
                            temSobreposicaoNaUltimaLinha = true;
                            // Se há sobreposição, FORÇAR empilhamento em cima
                            var novaY = carAtiva.y - carambolaSize;
                            if (novaY >= limiteSuperior && novaY < posicaoYFinal) {
                                posicaoYFinal = novaY;
                            } else if (novaY < limiteSuperior) {
                                // Não pode empilhar (passaria do limite) - remover carambola
                                return null;
                            }
                        }
                    }
                }
                
                // Se ainda está na última linha após verificação, garantir que não há sobreposição
                var posicaoFinalNaUltimaLinha = Math.abs(posicaoYFinal - limiteSuperior) < carambolaSize * 0.6;
                if (posicaoFinalNaUltimaLinha && temSobreposicaoNaUltimaLinha) {
                    // Se ainda há sobreposição, remover esta carambola
                    return null;
                }
                
                // Se está abaixo do limite, colocar exatamente no limite (última linha)
                if (posicaoYFinal < limiteSuperior) {
                    // Verificar se pode colocar no limite sem sobrepor
                    var podeColocarNoLimite = true;
                    for (var k = 0; k < carambolasAtivas.length; k++) {
                        var carAtiva = carambolasAtivas[k];
                        if (!carAtiva || carAtiva.y === undefined || carAtiva.size === undefined) continue;
                        
                        var diferencaYCarAtiva = Math.abs(carAtiva.y - limiteSuperior);
                        if (diferencaYCarAtiva < carambolaSize * 0.6) {
                            var raioAtivo = carAtiva.size / 2;
                            var centroAtivo = carAtiva.x + raioAtivo;
                            var distanciaX = Math.abs(centroAtivo - centroNova);
                            var distanciaMinimaExata = raioAtivo + raioNova;
                            
                            if (distanciaX < distanciaMinimaExata) {
                                podeColocarNoLimite = false;
                                break;
                            }
                        }
                    }
                    
                    if (podeColocarNoLimite) {
                        posicaoYFinal = limiteSuperior;
                    } else {
                        // Não pode colocar no limite - remover
                        return null;
                    }
                }
            }
            
            // Validação final: garantir que a posição é válida
            if (posicaoYFinal < 0 || posicaoYFinal > chao || isNaN(posicaoYFinal)) {
                console.warn('Posição Y inválida calculada:', posicaoYFinal, '- usando chão:', chao);
                posicaoYFinal = Math.max(limiteSuperior, chao - carambolaSize);
            }
            
            return posicaoYFinal;
        }
        
        function calcularQuantidadeCarambolas() {
            var width = window.innerWidth;
            var height = window.innerHeight;
            var area = width * height;
            var isDesktop = width >= 1024;
            
            // Calcular quantidade baseada na área da tela (aumentada para preencher mais)
            if (isDesktop) {
                // Desktop: carambolas maiores, quantidade aumentada para preencher melhor
                // Aproximadamente 1 carambola a cada 15000 pixels (aumentado de 20000)
                var quantidade = Math.floor(area / 15000);
                // Limites para desktop: aumentado para preencher mais espaços
                quantidade = Math.max(60, Math.min(quantidade, 120));
            } else {
                // Mobile: máximo 25 carambolas para preencher a tela até perto da frase
                var quantidade = Math.floor(area / 4500);
                // Limite máximo de 25 carambolas no mobile
                quantidade = Math.max(20, Math.min(quantidade, 25)); // Máximo 25 carambolas
            }
            
            return quantidade;
        }
        
        function verificarSobreposicao(centroX, centroY, size, espacoMinimo) {
            // Espaço mínimo entre carambolas (não podem encostar)
            // Se não for fornecido, calcular baseado no tamanho da tela
            if (!espacoMinimo) {
                var isDesktop = window.innerWidth >= 1024;
                // Desktop: 10% de espaço adicional, Mobile: 3% de espaço adicional (mais próximas)
                espacoMinimo = isDesktop ? (size * 1.1) : (size * 1.03);
            }
            
            for (var i = 0; i < posicoesOcupadas.length; i++) {
                var pos = posicoesOcupadas[i];
                var distancia = Math.sqrt(
                    Math.pow(centroX - pos.x, 2) + Math.pow(centroY - pos.y, 2)
                );
                
                // Se a distância entre os centros for menor que o tamanho + espaço mínimo, há sobreposição
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
            var isDesktop = containerWidth >= 1024;
            
            // Margem lateral e superior
            var margin = 15;
            // No desktop, margem inferior menor para encostar no footer; no mobile mantém margem
            var marginBottom = isDesktop ? 0 : margin;
            
            // Área disponível - desde a área reservada até o chão (parte inferior)
            var areaDisponivelX = containerWidth - margin * 2 - size;
            // Permitir que caiam até o chão - no desktop encostam no footer (sem margem), no mobile mantém margem
            var chao = containerHeight - size - marginBottom;
            var areaDisponivelY = chao - areaReservadaTopo - margin;
            
            // Espaço mínimo entre carambolas - menor no mobile para mais carambolas próximas
            var espacoMinimo = isDesktop ? (size * 1.1) : (size * 1.03); // Desktop: 10%, Mobile: 3%
            
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
                // No desktop, permitir chegar até o chão (encostar no footer); no mobile mantém margem superior
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
            var isDesktop = containerWidth >= 1024;
            
            // Se espacoMinimo não foi fornecido, calcular baseado no tamanho da tela
            if (!espacoMinimo) {
                espacoMinimo = isDesktop ? (size * 1.1) : (size * 1.03);
            }
            // Espaçamento: usar o espaço mínimo + um pequeno buffer
            var spacing = espacoMinimo * 1.05; // 5% de buffer adicional sobre o espaço mínimo
            
            // No desktop, margem inferior zero para encostar no footer; no mobile mantém margem
            var marginBottom = isDesktop ? 0 : margin;
            
            // Calcular chão (parte inferior da tela) - no desktop encosta no footer
            var chao = containerHeight - size - marginBottom;
            
            var colunas = Math.floor((containerWidth - margin * 2) / spacing);
            var linhas = Math.floor((chao - areaReservadaTopo - margin) / spacing);
            
            // Criar array de posições disponíveis
            var posicoesDisponiveis = [];
            for (var linha = 0; linha < linhas; linha++) {
                for (var col = 0; col < colunas; col++) {
                    var x = margin + col * spacing + (spacing - size) / 2;
                    var y = areaReservadaTopo + margin + linha * spacing + (spacing - size) / 2;
                    
                    // Garantir que não ultrapasse o chão (chao já é calculado como containerHeight - size - marginBottom)
                    // então y deve ser no máximo igual a chao para que a parte inferior seja containerHeight - marginBottom
                    if (y > chao) {
                        y = chao;
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
            
            // Fallback: posição aleatória até o chão (que já considera marginBottom)
            return {
                x: margin + Math.random() * (containerWidth - size - margin * 2),
                y: areaReservadaTopo + margin + Math.random() * (chao - areaReservadaTopo - margin)
            };
        }
        
        // Nova função: animação com efeito pipoca (de baixo para cima)
        function animarQuedaCarambolaPipoca(carambola, index, posicaoX, carambolaSize, containerWidth, containerHeight) {
            if (!carambola || !carambola.parentNode || !carambolasContainer) {
                return;
            }
            
            var viewportHeight = window.innerHeight;
            var viewportWidth = window.innerWidth;
            
            var containerRect = carambolasContainer.getBoundingClientRect();
            var containerHeightReal = containerRect.height || viewportHeight;
            var containerWidthReal = containerRect.width || viewportWidth;
            
            containerHeight = Math.min(containerHeightReal, viewportHeight);
            containerWidth = containerWidthReal;
            
            // Encontrar posição de baixo para cima
            var posicaoYFinal = encontrarPosicaoDeBaixoParaCima(posicaoX, carambolaSize, containerHeight, containerWidth);
            
            console.log('Carambola', index, '- Tamanho:', carambolaSize, 'X:', posicaoX, 'Y Final:', posicaoYFinal);
            
            if (posicaoYFinal === null || posicaoYFinal === undefined || isNaN(posicaoYFinal)) {
                console.warn('Carambola', index, 'removida - posição inválida:', posicaoYFinal);
                carambola.remove();
                return;
            }
            
            // Garantir que a posição é válida
            if (posicaoYFinal < 0) {
                posicaoYFinal = 0;
            }
            
            var startX = parseFloat(carambola.style.left) || posicaoX;
            // Posição inicial mais variada para efeito desleixado
            var startTop = -150 - Math.random() * 100; // Entre -150px e -250px (mais variado)
            var finalTop = posicaoYFinal;
            
            // Animação com efeito pipoca (bounce) - mais aleatória e desleixada
            var randomDuration = 0.5 + Math.random() * 0.6; // Duração mais variada (0.5 a 1.1s) para efeito mais desleixado
            var randomRotation = (Math.random() - 0.5) * 720; // Rotação maior (até 360 graus em cada direção)
            
            // Variação horizontal maior para efeito mais desleixado e aleatório
            // Aumentar muito a variação para que as carambolas "dançem" mais durante a queda
            var variacaoPercentual = containerWidth < 1024 ? 0.15 : 0.10; // Mobile: 15% (muito aumentado), Desktop: 10%
            var variacaoX = (Math.random() - 0.5) * (carambolaSize * variacaoPercentual);
            var posicaoXFinal = posicaoX + variacaoX;
            var margin = 20;
            posicaoXFinal = Math.max(margin, Math.min(posicaoXFinal, containerWidth - carambolaSize - margin));
            
            // Posição inicial
            carambola.style.left = startX + 'px';
            carambola.style.top = startTop + 'px';
            carambola.style.position = 'absolute';
            carambola.style.opacity = '0';
            carambola.style.display = 'block';
            
            if (typeof gsap === 'undefined' || !gsap) {
                // Fallback sem GSAP
                carambola.style.left = posicaoXFinal + 'px';
                carambola.style.top = finalTop + 'px';
                carambola.style.opacity = '1';
                carambola.style.transform = 'rotate(' + randomRotation + 'deg)';
                carambolasAtivas.push({
                    element: carambola,
                    x: posicaoXFinal,
                    y: finalTop,
                    size: carambolaSize
                });
                return;
            }
            
            // Posição inicial X também variada para efeito mais desleixado
            var startXVariado = startX + (Math.random() - 0.5) * (carambolaSize * 0.2); // Variação inicial de até 20%
            startXVariado = Math.max(margin, Math.min(startXVariado, containerWidth - carambolaSize - margin));
            
            // Definir posição inicial
            gsap.set(carambola, {
                top: startTop + 'px',
                left: startXVariado + 'px',
                opacity: 0,
                rotation: (Math.random() - 0.5) * 180, // Rotação inicial aleatória
                scale: 0.4 + Math.random() * 0.3 // Escala inicial variada (0.4 a 0.7)
            });
            
            // Animação com efeito pipoca (bounce) - mais desleixada
            try {
                // Adicionar movimento horizontal durante a queda para efeito mais desleixado
                var movimentoHorizontal = (Math.random() - 0.5) * (carambolaSize * 0.25); // Movimento lateral durante queda
                var posicaoXIntermediaria = posicaoXFinal + movimentoHorizontal;
                posicaoXIntermediaria = Math.max(margin, Math.min(posicaoXIntermediaria, containerWidth - carambolaSize - margin));
                
                var animacao = gsap.to(carambola, {
                    top: finalTop,
                    left: posicaoXIntermediaria, // Usar posição intermediária para movimento mais natural
                    opacity: 1,
                    rotation: randomRotation,
                    scale: 1,
                    duration: randomDuration,
                    ease: "back.out(1.5)", // Ease um pouco menos exagerado para movimento mais natural
                    onComplete: function() {
                        // Ajustar posição final para a posição calculada corretamente
                        var posicaoXFinalAjustada = posicaoXFinal;
                        carambola.style.top = finalTop + 'px';
                        carambola.style.left = posicaoXFinalAjustada + 'px';
                        carambola.style.opacity = '1';
                        carambola.style.transform = 'rotate(' + randomRotation + 'deg)';
                        carambola.style.display = 'block';
                        
                        // Limpar transforms do GSAP
                        try {
                            gsap.set(carambola, { clearProps: "transform" });
                        } catch(e) {
                            console.warn('Erro ao limpar transforms:', e);
                        }
                        
                        // Reaplicar rotação
                        if (randomRotation !== 0) {
                            carambola.style.transform = 'rotate(' + randomRotation + 'deg)';
                        }
                        
                        // Registrar carambola ativa
                        carambolasAtivas.push({
                            element: carambola,
                            x: posicaoXFinalAjustada,
                            y: finalTop,
                            size: carambolaSize
                        });
                        
                        console.log('Carambola', index, 'animação completa - Y:', finalTop);
                        
                        if (typeof aplicarEfeitoGelatina === 'function') {
                            aplicarEfeitoGelatina(carambola);
                        }
                    },
                    onError: function() {
                        console.error('Erro na animação GSAP para carambola', index);
                        // Fallback: colocar diretamente
                        carambola.style.left = posicaoXFinal + 'px';
                        carambola.style.top = finalTop + 'px';
                        carambola.style.opacity = '1';
                        carambola.style.transform = 'rotate(' + randomRotation + 'deg)';
                        carambola.style.display = 'block';
                        carambolasAtivas.push({
                            element: carambola,
                            x: posicaoXFinal,
                            y: finalTop,
                            size: carambolaSize
                        });
                    }
                });
            } catch(e) {
                console.error('Erro ao criar animação GSAP:', e);
                // Fallback: colocar diretamente
                carambola.style.left = posicaoXFinal + 'px';
                carambola.style.top = finalTop + 'px';
                carambola.style.opacity = '1';
                carambola.style.transform = 'rotate(' + randomRotation + 'deg)';
                carambola.style.display = 'block';
                carambolasAtivas.push({
                    element: carambola,
                    x: posicaoXFinal,
                    y: finalTop,
                    size: carambolaSize
                });
            }
        }
        
        // Função antiga mantida para compatibilidade
        function animarQuedaCarambolaFisica(carambola, index, posicaoX, containerWidth, containerHeight) {
            if (!carambola || !carambola.parentNode || !carambolasContainer) {
                return;
            }
            
            // Usar altura da VIEWPORT diretamente (mais confiável)
            var viewportHeight = window.innerHeight;
            var viewportWidth = window.innerWidth;
            
            // Recalcular dimensões do container para referência
            var containerRect = carambolasContainer.getBoundingClientRect();
            var containerHeightReal = containerRect.height || viewportHeight;
            var containerWidthReal = containerRect.width || viewportWidth;
            
            // Usar a MENOR altura entre viewport e container (para garantir que não ultrapasse)
            containerHeight = Math.min(containerHeightReal, viewportHeight);
            containerWidth = containerWidthReal;
            
            var marginBottom = containerWidth >= 1024 ? 0 : 15;
            
            // CHÃO = altura da VIEWPORT - tamanho da carambola - margem inferior
            // Esta é a posição Y MÁXIMA onde o TOPO da carambola pode estar
            // Usar viewportHeight diretamente para garantir que pare no fundo visível
            var chaoMaximo = viewportHeight - carambolaSize - marginBottom;
            
            // Garantir que o chão não seja negativo
            if (chaoMaximo < 0) {
                chaoMaximo = 0;
            }
            
            // Se o container for menor que a viewport, ajustar
            if (containerHeightReal < viewportHeight) {
                var chaoContainer = containerHeightReal - carambolaSize - marginBottom;
                if (chaoContainer < chaoMaximo) {
                    chaoMaximo = chaoContainer;
                }
            }
            
            var startX = parseFloat(carambola.style.left) || posicaoX;
            // Duração reduzida para animação mais rápida (loading mais rápido)
            var randomDuration = 0.4 + Math.random() * 0.4; // Era 1.0 + 1.5, agora 0.4 + 0.4
            var randomRotation = (Math.random() - 0.5) * 720;
            
            // Variação horizontal muito reduzida para manter organização (sem sobreposição)
            // Apenas pequena variação para aspecto natural, mas mínima para evitar colisões
            var variacaoX = (Math.random() - 0.5) * (carambolaSize * 0.05); // Apenas 5% de variação
            var posicaoXFinal = posicaoX + variacaoX;
            
            var margin = 20;
            // Garantir que não saia dos limites
            posicaoXFinal = Math.max(margin, Math.min(posicaoXFinal, containerWidth - carambolaSize - margin));
            
            // Se a variação for muito pequena (menos de 2px), usar a posição original exata
            if (Math.abs(posicaoXFinal - posicaoX) < 2) {
                posicaoXFinal = posicaoX;
            }
            
            // Verificar empilhamento usando a posição X FINAL (com a pequena variação)
            // Isso garante que a detecção de colisão seja precisa
            var posicaoYFinal = encontrarPosicaoEmpilhamento(posicaoXFinal, carambolaSize, containerHeight, containerWidth);
            
            if (posicaoYFinal === null || posicaoYFinal === undefined || isNaN(posicaoYFinal)) {
                console.warn('Carambola', index, 'removida - posição inválida:', posicaoYFinal);
                carambola.remove();
                return;
            }
            
            // Garantir que a posição é válida
            if (posicaoYFinal < 0) {
                posicaoYFinal = 0;
            }
            
            // VALIDAÇÃO ABSOLUTA: A posição Y final NUNCA pode ser maior que o chão máximo
            if (posicaoYFinal > chaoMaximo) {
                posicaoYFinal = chaoMaximo;
            }
            
            // Garantir que não seja negativo
            if (posicaoYFinal < 0) {
                posicaoYFinal = 0;
            }
            
            // VALIDAÇÃO FINAL: A parte inferior (topo + tamanho) não pode ultrapassar o container
            var parteInferior = posicaoYFinal + carambolaSize;
            var limiteInferior = containerHeight - marginBottom;
            if (parteInferior > limiteInferior) {
                posicaoYFinal = limiteInferior - carambolaSize;
                if (posicaoYFinal < 0) posicaoYFinal = 0;
            }
            
            console.log('Carambola', index, '- Viewport:', viewportHeight, 'Container:', containerHeight, 'Chão Máximo:', chaoMaximo, 'Y Final:', posicaoYFinal);
            
            // Usar posicaoYFinal já validada
            var finalTop = posicaoYFinal;
            
            // Posição inicial
            carambola.style.left = startX + 'px';
            carambola.style.top = '-100px';
            carambola.style.position = 'absolute';
            carambola.style.opacity = '0';
            carambola.style.display = 'block'; // Garantir que está visível
            
            console.log('Iniciando animação carambola', index, '- Y final:', finalTop, 'Chão:', chaoMaximo);
            
            if (typeof gsap === 'undefined' || !gsap) {
                // Fallback sem GSAP - colocar diretamente na posição final
                console.log('GSAP não disponível, usando fallback para carambola', index);
                carambola.style.left = posicaoXFinal + 'px';
                carambola.style.top = finalTop + 'px';
                carambola.style.opacity = '1';
                carambola.style.transform = 'rotate(' + randomRotation + 'deg)';
                carambolasAtivas.push({
                    element: carambola,
                    x: posicaoXFinal,
                    y: finalTop,
                    size: carambolaSize
                });
                return;
            }
            
            // Usar GSAP para animar
            var startTop = -100;
            
            // Definir posição inicial novamente (pode ter sido alterada)
            gsap.set(carambola, {
                top: startTop + 'px',
                left: startX + 'px',
                opacity: 0,
                rotation: 0
            });
            
            // Animação com GSAP - ease mais rápido para sensação de velocidade
            var animacao = gsap.to(carambola, {
                top: finalTop,
                left: posicaoXFinal,
                opacity: 1,
                rotation: randomRotation,
                duration: randomDuration,
                ease: "power2.in", // Ease mais rápido que power1.in
                onUpdate: function() {
                    // Durante a animação, verificar se não ultrapassou o chão
                    var topAtual = parseFloat(carambola.style.top) || startTop;
                    var chaoAtual = window.innerHeight - carambolaSize - (containerWidth >= 1024 ? 0 : 15);
                    if (topAtual > chaoAtual) {
                        // Pausar animação e forçar posição no chão
                        animacao.pause();
                        animacao.kill();
                        carambola.style.top = chaoAtual + 'px';
                        finalTop = chaoAtual;
                        chaoMaximo = chaoAtual;
                    }
                },
                onComplete: function() {
                    // FORÇAR posição final exata usando CSS direto
                    var topFinal = finalTop;
                    if (topFinal > chaoMaximo) {
                        topFinal = chaoMaximo;
                    }
                    
                    // Limpar transforms do GSAP e usar CSS direto
                    gsap.set(carambola, { clearProps: "all" });
                    
                    carambola.style.top = topFinal + 'px';
                    carambola.style.left = posicaoXFinal + 'px';
                    carambola.style.opacity = '1';
                    carambola.style.transform = 'rotate(' + randomRotation + 'deg)';
                    carambola.style.display = 'block';
                    
                    console.log('Carambola', index, 'PAROU em Y:', topFinal, '/ Chão:', chaoMaximo, '/ Viewport:', viewportHeight);
                    
                    // Registrar carambola ativa
                    carambolasAtivas.push({
                        element: carambola,
                        x: posicaoXFinal,
                        y: topFinal,
                        size: carambolaSize
                    });
                    
                    if (typeof aplicarEfeitoGelatina === 'function') {
                        aplicarEfeitoGelatina(carambola);
                    }
                },
                onError: function() {
                    // Se houver erro na animação, colocar diretamente na posição final
                    console.error('Erro na animação GSAP para carambola', index, '- usando fallback');
                    carambola.style.left = posicaoXFinal + 'px';
                    carambola.style.top = finalTop + 'px';
                    carambola.style.opacity = '1';
                    carambola.style.transform = 'rotate(' + randomRotation + 'deg)';
                    carambola.style.display = 'block';
                    carambolasAtivas.push({
                        element: carambola,
                        x: posicaoXFinal,
                        y: finalTop,
                        size: carambolaSize
                    });
                }
            });
        }
        
        // Manter função antiga para compatibilidade (caso seja chamada em outro lugar)
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
            // No desktop, margem inferior zero para encostar no footer; no mobile mantém margem
            var marginBottom = isDesktop ? 0 : margin;
            var chao = containerHeight - carambolaSize - marginBottom;
            
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

