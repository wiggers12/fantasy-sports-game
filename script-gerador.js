// INÍCIO DO BLOCO DE JAVASCRIPT PRINCIPAL (script-gerador.js)
// Este arquivo contém toda a lógica do seu gerador de prévias.

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
// Importe as funções específicas do Firestore
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Your web app's Firebase configuration (SUAS CREDENCIAIS REAIS)
const firebaseConfig = {
    apiKey: "AIzaSyA2kP9ZbC6kiTcShOEZaXtkZcuBKVcPw88", // Seu apiKey <-- SUBSTITUA
    authDomain: "fantasysportsgame-dc63d.firebaseapp.com", // Seu authDomain <-- SUBSTITUA
    projectId: "fantasysportsgame-dc63d", // Seu projectId <-- SUBSTITUA
    storageBucket: "fantasysportsgame-dc63d.firebasestorage.app", // Seu storageBucket <-- SUBSTITUA
    messagingSenderId: "179581906873", // Seu messagingSenderId <-- SUBSTITUA
    appId: "1:179581906873:web:d5229c525ff972643ad068", // Seu appId <-- SUBSTITUA
    measurementId: "G-5V9SDFQK5Y" // Seu measurementId <-- SUBSTITUA
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Analytics inicializado, mas não usado na lógica principal
const db = getFirestore(app); // Inicializa o Firestore

// Variáveis globais para o seu script (acesse-as via window.variavel se precisar de fora do módulo)
let currentPrimaryColor = '#007bff';
let currentSecondaryColor = '#343a40';
let currentAccentColor = '#ffc107';
let currentLayout = 'modern'; // Default layout

let currentSectionIndex = 0;
const formSections = document.querySelectorAll('.form-section');

// Conteúdo detalhado das funcionalidades para o modal
window.featureDescriptions = { // Exposto em window para o modal na nova janela
    "Cadastro de Clientes": {
        icon: "fa-solid fa-user-plus",
        description: "Gerencie seus contatos, histórico de interações e preferências, personalizando o atendimento e construindo relacionamentos duradouros e eficientes."
    },
    "Agenda / Agendamento Online": {
        icon: "fa-solid fa-calendar-check",
        description: "Permita que seus clientes agendem serviços ou reuniões online de forma fácil e automatizada, otimizando seu tempo e evitando conflitos de horários. Inclui lembretes automáticos."
    },
    "Catálogo de Produtos / Serviços": {
        icon: "fa-solid fa-boxes-stacked",
        description: "Exponha seus produtos ou serviços com fotos de alta qualidade, descrições detalhadas e categorias organizadas, facilitando a navegação e a decisão de compra dos seus clientes."
    },
    "Gestão de Produtos / Estoque": {
        icon: "fa-solid fa-boxes-packing",
        description: "Mantenha o controle total do seu inventário. Adicione, edite e organize produtos, acompanhe o estoque em tempo real e receba alertas para reposição inteligente."
    },
    "Controle Financeiro / Dashboard": {
        icon: "fa-solid fa-chart-line",
        description: "Tenha uma visão clara da saúde financeira do seu negócio com gráficos e relatórios intuitivos. Acompanhe vendas, despesas, lucros e métricas essenciais para tomadas de decisão."
    },
    "Sistema de Pedidos / Compras": {
        icon: "fa-solid fa-cart-shopping",
        description: "Simplifique o processo de compra para seus clientes e de gestão de pedidos para sua equipe, com carrinhos de compra, checkout seguro e acompanhamento de status em tempo real."
    },
    "Blog / Notícias": {
        icon: "fa-solid fa-newspaper",
        description: "Engaje seu público com conteúdo relevante, atraia novos visitantes através de otimização SEO e posicione sua marca como uma autoridade em seu nicho de mercado, gerando tráfego qualificado."
    },
    "Integração com Redes Sociais": {
        icon: "fa-solid fa-share-nodes",
        description: "Conecte seu site às suas redes sociais favoritas, amplificando seu alcance, direcionando tráfego qualificado e facilitando o compartilhamento de conteúdo, promovendo sua marca."
    },
    "Formulário de Contato Personalizado": {
        icon: "fa-solid fa-envelope-open-text",
        description: "Capture informações valiosas de seus visitantes com formulários adaptados às suas necessidades, facilitando o contato e a geração de leads qualificados para seu funil de vendas."
    },
    "Área de Membros / Login": {
        icon: "fa-solid fa-user-lock",
        description: "Ofereça conteúdo exclusivo, serviços personalizados ou uma comunidade privada para seus usuários cadastrados, construindo fidelidade à marca e um ambiente de valor agregado."
    },
    "Outras Funcionalidades": { // Conteúdo para o item de 'outras funcionalidades' digitadas
        icon: "fa-solid fa-plus-circle",
        description: "Funcionalidades adicionais e específicas que podem ser desenvolvidas sob medida para atender às necessidades exclusivas do seu negócio, garantindo uma solução completa."
    }
};


document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG: DOMContentLoaded disparado. Iniciando setup.');

    // Inicializa o estado do checkmark de cores para o padrão selecionado
    const defaultColorBox = document.querySelector('.color-box.color1');
    if (defaultColorBox) {
        defaultColorBox.classList.add('selected');
        defaultColorBox.querySelector('i').style.display = 'block';
    }

    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Set default colors and layout (já feito no CSS ou HTML)
    document.documentElement.style.setProperty('--primary-color', currentPrimaryColor);
    document.documentElement.style.setProperty('--secondary-color', currentSecondaryColor);
    document.documentElement.style.setProperty('--accent-color', currentAccentColor);

    // Anexa event listeners aos inputs para updatePreview e validação
    const inputs = document.querySelectorAll(
        '#section-info input, #section-info textarea, ' +
        '#section-content input:not([type="checkbox"]), #section-content textarea, ' + // Exclui checkboxes
        '#section-features input:not([type="checkbox"]), #section-features textarea, ' + // Exclui checkboxes
        '#section-audience input, #section-audience textarea, ' +
        '#section-contact input, #section-contact textarea' // Adicionado textarea para contato
    );
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('invalid');
            input.style.borderColor = ''; // Reseta a borda
        });
        input.addEventListener('keyup', updatePreview);
    });

    // Anexa event listeners aos botões de navegação
    document.querySelectorAll('button.next-button').forEach(button => {
        button.addEventListener('click', function() {
            nextSection(this.dataset.nextSection);
        });
    });
    document.querySelectorAll('button.prev-button').forEach(button => {
        button.addEventListener('click', function() {
            prevSection(this.dataset.prevSection);
        });
    });
    document.getElementById('generate-preview-btn').addEventListener('click', generateFinalPreview);
    document.getElementById('fullscreen-btn').addEventListener('click', openFullscreenPreview);
    document.getElementById('close-modal-btn').addEventListener('click', closeFeatureDetails); // Listener para fechar o modal


    // Anexa event listeners aos color boxes
    document.querySelectorAll('.color-box').forEach(colorBox => {
        colorBox.addEventListener('click', function() {
            const primary = this.dataset.primary;
            const secondary = this.dataset.secondary;
            const accent = this.dataset.accent;
            console.log('DEBUG: Clicou na cor:', primary); // Log para diagnóstico
            selectColors(this, primary, secondary, accent);
        });
    });

    // Anexa event listeners aos layout boxes
    document.querySelectorAll('.layout-box').forEach(layoutBox => {
        layoutBox.addEventListener('click', function() {
            const layout = this.dataset.layout;
            console.log('DEBUG: Clicou no layout:', layout); // Log para diagnóstico
            selectLayout(this, layout);
        });
    });

    // Adiciona evento de mudança para os checkboxes de funcionalidade
    document.querySelectorAll('input[type="checkbox"][name="feature"]').forEach(checkbox => {
        checkbox.addEventListener('change', updatePreview);
    });


    const whatsappButton = document.getElementById('whatsapp-final-button');
    document.getElementById('nome_empresa').addEventListener('keyup', () => {
        const empresaNome = document.getElementById('nome_empresa').value || 'Cliente Interessado';
        whatsappButton.href = `https://api.whatsapp.com/send?phone=5551989378751&text=Olá,%20gostei%20da%20prévia%20do%20meu%20site%20e%20quero%20saber%20como%20ficaria%20pronto!%20Meu%20nome%20é%20${encodeURIComponent(empresaNome)}`;
    });
    whatsappButton.href = `https://api.whatsapp.com/send?phone=5551989378751&text=Olá,%20gostei%20da%20prévia%20do%20meu%20site%20e%20quero%20saber%20como%20ficaria%20pronto!%20Meu%20nome%20é%20[Nome da Empresa]`; // SEUNUMERO <-- SUBSTITUA

    // Esconde o conteúdo principal e mostra a splash screen
    document.querySelector('.container').style.display = 'none';
    document.getElementById('splash-screen').style.display = 'flex';

    setTimeout(() => {
        console.log('DEBUG: Splash screen timeout triggered. Starting fade-out.');
        document.getElementById('splash-screen').classList.add('fade-out');
        setTimeout(() => {
            console.log('DEBUG: Splash screen fully faded. Displaying container.');
            document.getElementById('splash-screen').style.display = 'none';
            document.querySelector('.container').style.display = 'block'; // Mostra o conteúdo principal
        }, 1000); // Tempo da transição de fade-out
    }, 3000); // Tempo que a splash screen fica visível (3 segundos)

    console.log('DEBUG: DOMContentLoaded setup complete.');
});

// Funções para manipulação de seções
function showSection(index) {
    console.log(`DEBUG: showSection chamada com índice: ${index}`);
    try {
        formSections.forEach((section, i) => {
            if (i === index) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
        currentSectionIndex = index;
    } catch (error) {
        console.error("ERRO em showSection:", error);
    }
}

function nextSection(nextSectionId) {
    console.log(`DEBUG: nextSection chamada para: ${nextSectionId}`);
    try {
        const currentSection = formSections[currentSectionIndex];
        const inputs = currentSection.querySelectorAll('input[required], textarea[required]');
        let allValid = true;

        console.log(`DEBUG: Verificando ${inputs.length} campos obrigatórios na seção atual.`);

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('invalid');
                input.style.borderColor = '#dc3545';
                allValid = false;
                console.log(`DEBUG: Campo obrigatório vazio: ${input.id}`);
            } else {
                input.classList.remove('invalid');
                input.style.borderColor = '';
            }
        });

        console.log(`DEBUG: allValid = ${allValid}`);

        if (allValid) {
            const nextSectionElement = document.getElementById(nextSectionId);
            if (nextSectionElement) {
                console.log(`DEBUG: Avançando para a seção: ${nextSectionElement.id}`);
                showSection(Array.from(formSections).indexOf(nextSectionElement));
                // Scroll to top of the form for better UX
                window.scrollTo({
                    top: document.querySelector('.container').offsetTop,
                    behavior: 'smooth'
                });
            } else {
                console.error(`ERRO: Elemento da próxima seção (${nextSectionId}) não encontrado.`);
            }
        } else {
            alert('Por favor, preencha todos os campos obrigatórios antes de prosseguir.');
        }
    } catch (error) {
        console.error("ERRO em nextSection:", error);
    }
}

function prevSection(prevSectionId) {
    console.log(`DEBUG: prevSection chamada para: ${prevSectionId}`);
    try {
        const prevSectionElement = document.getElementById(prevSectionId);
        if (prevSectionElement) {
            showSection(Array.from(formSections).indexOf(prevSectionElement));
            // Scroll to top of the form for better UX
            window.scrollTo({
                top: document.querySelector('.container').offsetTop,
                behavior: 'smooth'
            });
        } else {
            console.error(`ERRO: Elemento da seção anterior (${prevSectionId}) não encontrado.`);
        }
    } catch (error) {
        console.error("ERRO em prevSection:", error);
    }
}

// Funções para atualização da prévia
function updatePreview() {
    console.log('DEBUG: updatePreview executada.');
    try {
        document.getElementById('preview-empresa').textContent = document.getElementById('nome_empresa').value || 'Sua Empresa Online';
        document.getElementById('preview-slogan').textContent = document.getElementById('slogan').value || 'Transformando Ideias em Resultados';
        document.getElementById('preview-descricao').textContent = document.getElementById('descricao').value || 'Aqui aparecerá a descrição da sua empresa. Somos apaixonados por [seu nicho] e ajudamos [seu público-alvo] a alcançar [objetivo].';
        document.getElementById('preview-titulo-servicos').textContent = document.getElementById('titulo_servicos').value || 'Nossos Produtos e Soluções';

        const servicosLista = document.getElementById('servicos_lista').value.split('\n').filter(item => item.trim() !== '');
        const ulServicos = document.getElementById('preview-servicos-lista');
        ulServicos.innerHTML = '';
        if (servicosLista.length > 0) {
            servicosLista.forEach(servico => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${servico.trim()}`; // Ícone no item de serviço
                ulServicos.appendChild(li);
            });
        } else {
            ulServicos.innerHTML = '<li><i class="fa-solid fa-check-circle"></i> Desenvolvimento Web Personalizado</li><li><i class="fa-solid fa-check-circle"></i> Otimização para SEO</li><li><i class="fa-solid fa-check-circle"></i> Marketing de Conteúdo</li>';
        }

        // Novas seções de conteúdo - FUNCIONALIDADES
        const selectedFeatures = Array.from(document.querySelectorAll('input[name="feature"]:checked')).map(cb => ({
            name: cb.value,
            iconClass: cb.dataset.icon // Pega a classe do ícone do atributo data-icon
        }));
        const outrasFuncionalidadesText = document.getElementById('outras_funcionalidades').value.trim();

        const ulFuncionalidadesDisplay = document.getElementById('preview-funcionalidades-display-list');
        ulFuncionalidadesDisplay.innerHTML = '';
        
        // Adiciona funcionalidades selecionadas
        if (selectedFeatures.length > 0) {
            selectedFeatures.forEach(feature => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="${feature.iconClass}"></i> ${feature.name}`;
                li.onclick = () => openFeatureDetails(feature.name, featureDescriptions[feature.name]?.description || "Descrição não disponível.", feature.iconClass);
                ulFuncionalidadesDisplay.appendChild(li);
            });
        } else {
            // Adiciona um placeholder se nada for selecionado e não houver outras funcionalidades
            ulFuncionalidadesDisplay.innerHTML = `
                <li onclick="openFeatureDetails('Sistema Flexível', 'Nosso sistema é construído para se adaptar às suas necessidades, permitindo personalizações e expansões futuras sem grandes complicações.', 'fa-solid fa-cogs')"><i class="fa-solid fa-cogs"></i> Sistema Flexível</li>
                <li onclick="openFeatureDetails('Experiência do Usuário', 'Focamos na criação de interfaces intuitivas e agradáveis, garantindo que seus clientes tenham a melhor experiência ao navegar em seu site ou app.', 'fa-solid fa-star')"><i class="fa-solid fa-star"></i> Experiência do Usuário</li>
                <li onclick="openFeatureDetails('Segurança de Dados', 'Implementamos as melhores práticas de segurança para proteger seus dados e os de seus clientes, garantindo a integridade e a confidencialidade das informações.', 'fa-solid fa-shield-alt')"><i class="fa-solid fa-shield-alt"></i> Segurança de Dados</li>
                <li onclick="openFeatureDetails('Escalabilidade na Nuvem', 'Construímos seu projeto em infraestruturas de nuvem escaláveis, permitindo que seu site ou app cresça junto com seu negócio, sem preocupações com picos de acesso.', 'fa-solid fa-cloud')"><i class="fa-solid fa-cloud"></i> Escalabilidade na Nuvem</li>
            `;
        }

        // Adiciona 'Outras Funcionalidades' se preenchido
        const previewOutrasFunc = document.getElementById('preview-outras-funcionalidades-display');
        if (outrasFuncionalidadesText) {
            const liOutras = document.createElement('li');
            liOutras.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Outras: ${outrasFuncionalidadesText}`;
            liOutras.onclick = () => openFeatureDetails('Outras Funcionalidades', featureDescriptions['Outras Funcionalidades'].description || "Funcionalidades adicionais.", 'fa-solid fa-plus-circle');
            ulFuncionalidadesDisplay.appendChild(liOutras);
        }

        document.getElementById('preview-objetivo-principal-display').textContent = document.getElementById('objetivo_principal').value ? `Nosso principal objetivo é ${document.getElementById('objetivo_principal').value}.` : 'Nosso principal objetivo é [Objetivo Principal do Site/App].';
        
        // Novas seções de conteúdo - PÚBLICO E MENSAGEM
        document.getElementById('preview-titulo-publico').textContent = document.getElementById('publico_alvo').value ? `Para ${document.getElementById('publico_alvo').value}` : 'Para Quem Criamos Soluções';
        document.getElementById('preview-publico-alvo-display').textContent = document.getElementById('publico_alvo').value ? `Nosso público-alvo principal são: ${document.getElementById('publico_alvo').value}.` : 'Nosso público-alvo são [Público-Alvo Principal].';
        document.getElementById('preview-mensagem-central-display').innerHTML = document.getElementById('mensagem_central').value ? `A mensagem más importante que queremos transmitir é: <strong>${document.getElementById('mensagem_central').value}</strong>` : 'A mensagem más importante que queremos transmitir é: <strong>[Mensagem Central do Site/App]</strong>';


        document.getElementById('preview-contato-email').textContent = (document.getElementById('contato_email').value ? 'Email: ' + document.getElementById('contato_email').value : 'contato@suaempresa.com');
        document.getElementById('preview-contato-telefone').textContent = (document.getElementById('contato_telefone').value ? 'Telefone: ' + document.getElementById('contato_telefone').value : '(XX) XXXXX-XXXX');
        const linkRedes = document.getElementById('link_redes').value;
        const previewRedesLink = document.querySelector('#preview-redes a');
        if (linkRedes) {
            previewRedesLink.href = linkRedes;
            previewRedesLink.textContent = 'Nossas Redes Sociais';
        } else {
            previewRedesLink.href = '#';
            previewRedesLink.textContent = 'Nossas Redes Sociais';
        }
    } catch (error) {
        console.error("ERRO em updatePreview:", error);
    }
}

// Funções de seleção de cores e layout
function selectColors(element, primary, secondary, accent) {
    console.log('DEBUG: selectColors executada para:', primary); // Log para diagnóstico
    try {
        document.querySelectorAll('.color-box').forEach(box => {
            box.classList.remove('selected');
            box.querySelector('i').style.display = 'none'; // Esconde o checkmark
        });
        element.classList.add('selected');
        element.querySelector('i').style.display = 'block'; // Mostra o checkmark

        document.documentElement.style.setProperty('--primary-color', primary);
        document.documentElement.style.setProperty('--secondary-color', secondary);
        document.documentElement.style.setProperty('--accent-color', accent);
        currentPrimaryColor = primary;
        currentSecondaryColor = secondary;
        currentAccentColor = accent;
        updatePreview();
    } catch (error) {
        console.error("ERRO em selectColors:", error);
    }
}

function selectLayout(element, layout) {
    console.log('DEBUG: selectLayout executada para:', layout); // Log para diagnóstico
    try {
        document.querySelectorAll('.layout-box').forEach(box => {
            box.classList.remove('selected');
        });
        element.classList.add('selected');
        currentLayout = layout;

        const root = document.documentElement.style;
        if (layout === 'modern') {
            root.setProperty('--preview-font-heading', "'Montserrat', sans-serif");
            root.setProperty('--preview-font-body', "'Open Sans', sans-serif");
            root.setProperty('--preview-border-radius', '8px');
            root.setProperty('--preview-spacing-unit', '20px');
        } else if (layout === 'classic') {
            root.setProperty('--preview-font-heading', "'Playfair Display', serif");
            root.setProperty('--preview-font-body', "'Roboto', sans-serif");
            root.setProperty('--preview-border-radius', '2px'); /* Más cuadrado */
            root.setProperty('--preview-spacing-unit', '25px'); /* Más espaçamento */
        } else if (layout === 'creative') {
            root.setProperty('--preview-font-heading', "'Pacifico', cursive");
            root.setProperty('--preview-font-body', "'Open Sans', sans-serif");
            root.setProperty('--preview-border-radius', '20px'); /* Más arredondado */
            root.setProperty('--preview-spacing-unit', '15px'); /* Menos espaçamento */
        }
        updatePreview();
    } catch (error) {
        console.error("ERRO em selectLayout:", error);
    }
}

function openFeatureDetails(title, description, iconClass) {
    console.log('DEBUG: openFeatureDetails executada para:', title); // Log para diagnóstico
    try {
        document.getElementById('modal-feature-title').innerHTML = `<i class="${iconClass}"></i> ${title}`;
        document.getElementById('modal-feature-description').textContent = description;
        document.getElementById('feature-modal-overlay').classList.add('active');
    } catch (error) {
        console.error("ERRO em openFeatureDetails:", error);
    }
}

function closeFeatureDetails() {
    console.log('DEBUG: closeFeatureDetails executada'); // Log para diagnóstico
    try {
        document.getElementById('feature-modal-overlay').classList.remove('active');
    } catch (error) {
        console.error("ERRO em closeFeatureDetails:", error);
    }
}

function generateFinalPreview() {
    console.log('DEBUG: generateFinalPreview executada.');
    try {
        const currentSection = formSections[currentSectionIndex];
        const inputs = currentSection.querySelectorAll('input[required], textarea[required]');
        let allValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('invalid');
                input.style.borderColor = '#dc3545';
                allValid = false;
                console.log(`DEBUG: Campo obrigatório vazio na seção final: ${input.id}`);
            } else {
                input.classList.remove('invalid');
                input.style.borderColor = '';
            }
        });

        if (!allValid) {
            const firstInvalidInput = currentSection.querySelector('input.invalid, textarea.invalid');
            if (firstInvalidInput) {
                firstInvalidInput.focus();
            }
            alert('Por favor, preencha todos os campos obrigatórios antes de gerar a prévia.');
            return;
        }

        document.getElementById('loading-overlay').classList.add('show');
        document.getElementById('error-message-display').style.display = 'none';
        document.getElementById('feedback-message').style.display = 'none';

        const empresaNome = document.getElementById('nome_empresa').value;
        const slogan = document.getElementById('slogan').value;
        const descricao = document.getElementById('descricao').value;
        const tituloServicos = document.getElementById('titulo_servicos').value;
        const servicosLista = document.getElementById('servicos_lista').value.split('\n').filter(item => item.trim() !== '');
        const outrasFuncionalidades = document.getElementById('outras_funcionalidades').value;
        const objetivoPrincipal = document.getElementById('objetivo_principal').value;
        const publicoAlvo = document.getElementById('publico_alvo').value;
        const mensagemCentral = document.getElementById('mensagem_central').value;
        const contatoEmail = document.getElementById('contato_email').value;
        const contatoTelefone = document.getElementById('contato_telefone').value;
        const linkRedes = document.getElementById('link_redes').value;

        const selectedFeatures = Array.from(document.querySelectorAll('input[name="feature"]:checked')).map(cb => cb.value);

        const previewData = {
            timestamp: serverTimestamp(),
            empresaNome,
            slogan,
            descricao,
            tituloServicos,
            servicosLista,
            selectedFeatures,
            outrasFuncionalidades,
            objetivoPrincipal,
            publicoAlvo,
            mensagemCentral,
            contatoEmail,
            contatoTelefone,
            linkRedes,
            design: {
                primaryColor: currentPrimaryColor,
                secondaryColor: currentSecondaryColor,
                accentColor: currentAccentColor,
                layout: currentLayout
            }
        };

        console.log('DEBUG: Dados da prévia para salvar:', previewData);

        try {
            const docRef = wait addDoc(collection(db, "previews"), previewData);
            console.log("DEBUG: Documento escrito com ID: ", docRef.id);
            document.getElementById('feedback-message').textContent = 'Prévia gerada e dados salvos com sucesso! ID: ' + docRef.id;
            document.getElementById('feedback-message').style.display = 'block';

            const whatsappButton = document.getElementById('whatsapp-final-button');
            whatsappButton.href = `https://api.whatsapp.com/send?phone=SEUNUMERO&text=Olá,%20gostei%20da%20prévia%20do%20meu%20site%20(ID:%20${docRef.id})%20e%20quero%20saber%20como%20ficaria%20pronto!%20Meu%20nome%20é%20${encodeURIComponent(empresaNome)}`; // SEUNUMERO <-- SUBSTITUA
            whatsappButton.style.display = 'inline-block'; // Garante que o botão aparece
        } catch (e) {
            console.error("ERRO ao adicionar documento: ", e);
            document.getElementById('error-message-display').textContent = 'Erro ao salvar a prévia. Tente novamente.';
            document.getElementById('error-message-display').style.display = 'block';
        } finally {
            document.getElementById('loading-overlay').classList.remove('show');
            document.getElementById('cta-final').style.display = 'block';
            document.getElementById('website-preview').classList.add('show');

            // Animação de fade-in para as seções da prévia
            document.querySelectorAll('.preview-section, .preview-header, .preview-footer').forEach(section => {
                section.classList.remove('fade-in'); // Remove para resetar a animação
                void section.offsetWidth; // Trigger reflow
                section.classList.add('fade-in'); // Adiciona novamente para animar
            });
        }
    } catch (error) {
        console.error("ERRO geral em generateFinalPreview:", error);
        document.getElementById('loading-overlay').classList.remove('show');
        document.getElementById('error-message-display').textContent = 'Ocorreu um erro inesperado ao gerar a prévia.';
        document.getElementById('error-message-display').style.display = 'block';
    }
}

function openFullscreenPreview() {
    console.log('DEBUG: openFullscreenPreview executada.');
    const previewElement = document.getElementById('website-preview');
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <title>Prévia do Site - ${document.getElementById('preview-empresa').textContent}</title>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            <style>
                body { margin: 0; font-family: 'Open Sans', sans-serif; }
                .website-preview {
                    border: none;
                    box-shadow: none;
                    min-height: 100vh;
                    width: 100%;
                    border-radius: 0;
                    display: flex;
                    flex-direction: column;
                }
                #fullscreen-btn { display: none; } /* Esconde o botão de tela cheia na nueva ventana */
                /* Copia todas las variables CSS y estilos de vista previa del padre */
                ${document.querySelector('style').innerHTML}
            </style>
        </head>
        <body>
            ${previewElement.innerHTML}
            <script type="module"> // Importante: script type="module" para usar imports e variables del módulo padre
                import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
                // Es necesario re-inicializar Firebase si vas a hacer operaciones de BD en esta nueva ventana
                // o pasar la instancia 'app' y 'db' desde el padre. Para este caso, simplifiquemos.

                // Acceso a las variables globales y funciones que ya fueron expuestas en el padre
                const currentPrimaryColor = window.currentPrimaryColor;
                const currentSecondaryColor = window.currentSecondaryColor;
                const currentAccentColor = window.currentAccentColor;
                const currentLayout = window.currentLayout;
                const featureDescriptions = window.featureDescriptions; // Accede a las descripciones globales

                document.documentElement.style.setProperty('--primary-color', currentPrimaryColor);
                document.documentElement.style.setProperty('--secondary-color', currentSecondaryColor);
                document.documentElement.style.setProperty('--accent-color', currentAccentColor);
                
                // Vuelve a aplicar los estilos de diseño si es necesario (ej. fuentes, border-radius, espaciado)
                const root = document.documentElement.style;
                const layout = currentLayout; // Obtiene el diseño actual del padre
                if (layout === 'modern') {
                    root.setProperty('--preview-font-heading', "'Montserrat', sans-serif");
                    root.setProperty('--preview-font-body', "'Open Sans', sans-serif");
                    root.setProperty('--preview-border-radius', '8px');
                    root.setProperty('--preview-spacing-unit', '20px');
                } else if (layout === 'classic') {
                    root.setProperty('--preview-font-heading', "'Playfair Display', serif");
                    root.setProperty('--preview-font-body', "'Roboto', sans-serif");
                    root.setProperty('--preview-border-radius', '2px');
                    root.setProperty('--preview-spacing-unit', '25px');
                } else if (layout === 'creative') {
                    root.setProperty('--preview-font-heading', "'Pacifico', cursive");
                    root.setProperty('--preview-font-body', "'Open Sans', sans-serif");
                    root.setProperty('--preview-border-radius', '20px');
                    root.setProperty('--preview-spacing-unit', '15px');
                }

                // Vuelve a añadir los escuchadores de eventos para los modales de características si es necesario
                window.openFeatureDetails = function(title, description, iconClass) {
                    alert(\`Función: \${title}\n\nDescripción: \${description}\`); // Alerta simple para modo de pantalla completa
                };
                document.querySelectorAll('.preview-section ul li').forEach(li => {
                    const cleanedFeatureName = li.textContent.trim().replace(/<i[^>]*>.*?<\/i>\s*/, ''); 
                    const feature = featureDescriptions[cleanedFeatureName] || featureDescriptions['Outras Funcionalidades'];
                    
                    if (feature) {
                        li.onclick = () => window.openFeatureDetails(cleanedFeatureName, feature.description, feature.icon);
                    }
                });
            </script>
        </body>
        </html>
    `);
    newWindow.document.close();
}
// FIM DO BLOCO DE JAVASCRIPT PRINCIPAL (script-gerador.js)
