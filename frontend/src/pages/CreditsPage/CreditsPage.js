import React, { useEffect } from 'react';
import './CreditsPage.css';
import Header from '../../components/Header';

const CreditsPage = () => {
    useEffect(() => {
        const sources = document.querySelectorAll('.source');
        const centerScreen = window.innerHeight / 2;

        const handleScroll = () => {
            sources.forEach(source => {
                const rect = source.getBoundingClientRect();
                const distanceFromCenter = Math.abs(rect.top + rect.height / 2 - centerScreen);
                const scale = Math.max(0.75, 1 - 0.0015 * distanceFromCenter);
                source.style.transform = `scale(${scale})`;
                source.style.opacity = 1 - 0.002 * distanceFromCenter;
            });
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial sizing

        // Custom slow auto-scroll
        let startAutoScroll = () => {
            let maxScroll = document.body.scrollHeight - window.innerHeight;
            let scrolled = window.scrollY;
            let step = 1; // How many pixels to scroll each interval, adjust for faster or slower scrolling

            let scrollInterval = setInterval(() => {
                if (scrolled < maxScroll) {
                    window.scrollBy(0, step);
                    scrolled += step;
                } else {
                    clearInterval(scrollInterval);
                }
            }, 10); // Interval in milliseconds, adjust for faster or slower scrolling
        };

        // Delay starting the auto-scroll
        setTimeout(startAutoScroll, 2000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div>
            <div className="fixed">
            <Header />
            </div>
            <div className="credits">
                <div className="title">
                    <h1>
                        Project Sources
                    </h1>
                    <h2>
                        A special thank you to all front-end open source project developers.
                    </h2>
                </div>
                <div className="section-title">
                    <h2>
                        Learn Page
                    </h2>
                </div>
                <div className="sources">
                    <div className="source">
                        <span>[1] ACM/IEEE Citation: Qiu, T. (2021, September 14). A Psychiatrist’s Perspective on Social Media Algorithms and Mental Health. Stanford Institute for Human-Centered Artificial Intelligence (HAI). Retrieved November 14, 2023, from </span>
                        <a href="https://hai.stanford.edu/news/psychiatrists-perspective-social-media-algorithms-and-mental-health" target="_blank" rel="noopener noreferrer">https://hai.stanford.edu/news/psychiatrists-perspective-social-media-algorithms-and-mental-health</a>
                    </div>
                    <div className="source">
                        <span>[2] Adam, David. "Machines can spot mental health issues—if you hand over your personal data." MIT Technology Review, 13 Aug. 2020, </span>
                        <a href="https://www.technologyreview.com/2020/08/13/1006573/digital-psychiatry-phenotyping-schizophrenia-bipolar-privacy/" target="_blank" rel="noopener noreferrer">https://www.technologyreview.com/2020/08/13/1006573/digital-psychiatry-phenotyping-schizophrenia-bipolar-privacy/</a>
                    </div>
                    <div className="source">
                        <span>[3] B. Murdoch, "Privacy and artificial intelligence: challenges for protecting health information in a new era," BMC Medical Ethics, vol. 22, no. 122, Sep. 2021. </span>
                        <a href="https://doi.org/10.1186/s12910-021-00687-3" target="_blank" rel="noopener noreferrer">https://doi.org/10.1186/s12910-021-00687-3</a>
                    </div>
                    <div className="source">
                        <span>[4] Felzmann, H., & Kennedy, R. (2016, September 28). Algorithms, Social Media and Mental Health. Society for Computers and Law (SCL). Retrieved November 14, 2023, from </span>
                        <a href="https://www.scl.org/articles/3746-algorithms-social-media-and-mental-health" target="_blank" rel="noopener noreferrer" className="link">https://www.scl.org/articles/3746-algorithms-social-media-and-mental-health</a>
                    </div>
                    <div className="source">
                        <span>[5] J. Frontend, "frontend-joe," GitHub. [Online]. Available: </span>
                        <a href="https://github.com/frontend-joe" target="_blank" rel="noopener noreferrer">https://github.com/frontend-joe</a>
                    </div>

                    <div className="source">
                        <span>[6] R. B. Jones et al., "A Digital Intervention for Adolescent Depression (MoodHwb): Mixed Methods Feasibility Evaluation," JMIR Mental Health, vol. 7, no. 7, Art. no. e14536, 2020. [Online]. Available: </span>
                        <a href="https://mental.jmir.org/2020/7/e14536" target="_blank" rel="noopener noreferrer">https://mental.jmir.org/2020/7/e14536</a>
                    </div>
                    <div className="source">
                        <span>[7] Uprise Health. "Ethical and Data Privacy Concerns for Mental Health Apps." Uprise Health, 26 May 2022, </span>
                        <a href="https://uprisehealth.com/resources/health-data-privacy-mental-health-app/" target="_blank" rel="noopener noreferrer">https://uprisehealth.com/resources/health-data-privacy-mental-health-app/</a>
                    </div>
                </div>
                <div className="section-title">
                    <h2>
                        Login Page
                    </h2>
                </div>
                <div className="sources">
                    <div className="source">
                        <span>[8] "Django documentation on authentication," Django. [Online]. Available: </span>
                        <a href="https://docs.djangoproject.com/en/5.0/topics/auth/" target="_blank" rel="noopener noreferrer">https://docs.djangoproject.com/en/5.0/topics/auth/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[9] J. Frontend, "frontend-joe," GitHub. [Online]. Available: </span>
                        <a href="https://github.com/frontend-joe" target="_blank" rel="noopener noreferrer">https://github.com/frontend-joe</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[10] X. Israeluni, "Monster Eléctrico," GitHub Gist. [Online]. Available: </span>
                        <a href="https://gist.github.com/xisraeluni/b96df9d820c19dcfbf705af8bd74a41f" target="_blank" rel="noopener noreferrer">https://gist.github.com/xisraeluni/b96df9d820c19dcfbf705af8bd74a41f</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[11] T. Jain, "tilakjain123," GitHub. [Online]. Available: </span>
                        <a href="https://github.com/tilakjain123" target="_blank" rel="noopener noreferrer">https://github.com/tilakjain123</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[12] G. Gevendra, "gevstack," GitHub. [Online]. Available: </span>
                        <a href="https://github.com/gevendra2004/gevstack" target="_blank" rel="noopener noreferrer">https://github.com/gevendra2004/gevstack</a>. [Accessed: 21-Apr-2024].
                    </div>
                </div>

                <div className="section-title">
                    <h2>
                        Travel Page
                    </h2>
                </div>
                <div className="sources">
                    <div className="source">
                        <span>[13] "Recommendation system in Python," GeeksforGeeks. [Online]. Available: </span>
                        <a href="https://www.geeksforgeeks.org/recommendation-system-in-python/" target="_blank" rel="noopener noreferrer">https://www.geeksforgeeks.org/recommendation-system-in-python/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[14] "Build a recommendation engine with collaborative filtering," Real Python. [Online]. Available: </span>
                        <a href="https://realpython.com/build-recommendation-engine-collaborative-filtering/" target="_blank" rel="noopener noreferrer">https://realpython.com/build-recommendation-engine-collaborative-filtering/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[15] "Recommender Systems in Python," DataCamp. [Online]. Available: </span>
                        <a href="https://www.datacamp.com/tutorial/recommender-systems-python" target="_blank" rel="noopener noreferrer">https://www.datacamp.com/tutorial/recommender-systems-python</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[16] G. Spmoreira, "Recommender Systems in Python 101," Kaggle. [Online]. Available: </span>
                        <a href="https://www.kaggle.com/code/gspmoreira/recommender-systems-in-python-101" target="_blank" rel="noopener noreferrer">https://www.kaggle.com/code/gspmoreira/recommender-systems-in-python-101</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[17] "Places API Overview," Google Developers. [Online]. Available: </span>
                        <a href="https://developers.google.com/maps/documentation/places/web-service/overview" target="_blank" rel="noopener noreferrer">https://developers.google.com/maps/documentation/places/web-service/overview</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[18] "Google Maps Platform Pricing," Google Maps Platform. [Online]. Available: </span>
                        <a href="https://mapsplatform.google.com/pricing/" target="_blank" rel="noopener noreferrer">https://mapsplatform.google.com/pricing/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[19] "How to use Google Places API and get an API key," Elfsight Blog. [Online]. Available: </span>
                        <a href="https://elfsight.com/blog/how-to-use-google-places-api-and-get-an-api-key/" target="_blank" rel="noopener noreferrer">https://elfsight.com/blog/how-to-use-google-places-api-and-get-an-api-key/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[20] "Compute Engine APIs," Google Cloud. [Online]. Available: </span>
                        <a href="https://cloud.google.com/compute/docs/apis" target="_blank" rel="noopener noreferrer">https://cloud.google.com/compute/docs/apis</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[21] J. Frontend, "frontend-joe," GitHub. [Online]. Available: </span>
                        <a href="https://github.com/frontend-joe" target="_blank" rel="noopener noreferrer">https://github.com/frontend-joe</a>. [Accessed: 21-Apr-2024].
                    </div>
                </div>

                <div className="section-title">
                    <h2>
                        Dashboard Page
                    </h2>
                </div>
                <div className="sources">
                    <div className="source">
                        <span>[22] "React Google Charts," React Google Charts. [Online]. Available: </span>
                        <a href="https://www.react-google-charts.com/" target="_blank" rel="noopener noreferrer">https://www.react-google-charts.com/</a>. [Accessed: 21-Apr-2024].
                    </div>
                </div>
                <div className="section-title">
                    <h2>
                        Preferences Page
                    </h2>
                </div>
                <div className="sources">
                    <div className="source">
                        <span>[23] "API Library," Google Cloud Console. [Online]. Available: </span>
                        <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener noreferrer">https://console.cloud.google.com/apis/library</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[24] "GitHub REST API documentation," GitHub Docs, 28 Nov. 2022. [Online]. Available: </span>
                        <a href="https://docs.github.com/en/rest?apiVersion=2022-11-28" target="_blank" rel="noopener noreferrer">https://docs.github.com/en/rest?apiVersion=2022-11-28</a>. [Accessed: 21-Apr-2024].
                    </div>
                </div>

                <div className="section-title">
                    <h2>
                        Full-Stack Deployment
                    </h2>
                </div>
                <div className="sources">
                    <div className="source">
                        <span>[25] S. Gupta, "How to connect ReactJS & Django framework," Medium. [Online]. Available: </span>
                        <a href="https://medium.com/@devsumitg/how-to-connect-reactjs-django-framework-c5ba268cb8be" target="_blank" rel="noopener noreferrer">https://medium.com/@devsumitg/how-to-connect-reactjs-django-framework-c5ba268cb8be</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[26] "How to connect Django with ReactJS," GeeksforGeeks. [Online]. Available: </span>
                        <a href="https://www.geeksforgeeks.org/how-to-connect-django-with-reactjs/" target="_blank" rel="noopener noreferrer">https://www.geeksforgeeks.org/how-to-connect-django-with-reactjs/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[27] "Creating and deploying Python Django applications on Elastic Beanstalk," AWS Elastic Beanstalk, AWS. [Online]. Available: </span>
                        <a href="https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create-deploy-python-django.html" target="_blank" rel="noopener noreferrer">https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create-deploy-python-django.html</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[28] "LeetCode," LeetCode. [Online]. Available: </span>
                        <a href="https://leetcode.com/" target="_blank" rel="noopener noreferrer">https://leetcode.com/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[29] "Connect Django and React," Stack Overflow. [Online]. Available: </span>
                        <a href="https://stackoverflow.com/questions/69609264/connect-django-and-react" target="_blank" rel="noopener noreferrer">https://stackoverflow.com/questions/69609264/connect-django-and-react</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[30] Nagato, "How to connect Django to ReactJS," DEV Community. [Online]. Available: </span>
                        <a href="https://dev.to/nagatodev/how-to-connect-django-to-reactjs-1a71" target="_blank" rel="noopener noreferrer">https://dev.to/nagatodev/how-to-connect-django-to-reactjs-1a71</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[31] "React - A JavaScript library for building user interfaces," React. [Online]. Available: </span>
                        <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">https://react.dev/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[32] "The Web framework for perfectionists with deadlines," Django. [Online]. Available: </span>
                        <a href="https://www.djangoproject.com/" target="_blank" rel="noopener noreferrer">https://www.djangoproject.com/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[33] "Lordicon," Lordicon. [Online]. Available: </span>
                        <a href="https://lordicon.com/" target="_blank" rel="noopener noreferrer">https://lordicon.com/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[34] "Lordicon Lottie Files," Lottie Files. [Online]. Available: </span>
                        <a href="https://lottiefiles.com/lordicon" target="_blank" rel="noopener noreferrer">https://lottiefiles.com/lordicon</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[35] "Axios API Introduction," Axios. [Online]. Available: </span>
                        <a href="https://axios-http.com/docs/api_intro" target="_blank" rel="noopener noreferrer">https://axios-http.com/docs/api_intro</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[36] "Using CSS animations," MDN Web Docs. [Online]. Available: </span>
                        <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations" target="_blank" rel="noopener noreferrer">https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[37] "CSS3 Animations," W3Schools. [Online]. Available: </span>
                        <a href="https://www.w3schools.com/css/css3_animations.asp" target="_blank" rel="noopener noreferrer">https://www.w3schools.com/css/css3_animations.asp</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[38] "Learn CSS animations," Web.dev. [Online]. Available: </span>
                        <a href="https://web.dev/learn/css/animations" target="_blank" rel="noopener noreferrer">https://web.dev/learn/css/animations</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[39] "Canva," Canva. [Online]. Available: </span>
                        <a href="https://www.canva.com/" target="_blank" rel="noopener noreferrer">https://www.canva.com/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[40] "Figma," Figma. [Online]. Available: </span>
                        <a href="https://www.figma.com/" target="_blank" rel="noopener noreferrer">https://www.figma.com/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[41] "AWS Documentation," AWS. [Online]. Available: </span>
                        <a href="https://docs.aws.amazon.com/" target="_blank" rel="noopener noreferrer">https://docs.aws.amazon.com/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[42] "Amazon EC2 Documentation," AWS. [Online]. Available: </span>
                        <a href="https://docs.aws.amazon.com/ec2/" target="_blank" rel="noopener noreferrer">https://docs.aws.amazon.com/ec2/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[43] "Amazon Route 53 Documentation," AWS. [Online]. Available: </span>
                        <a href="https://docs.aws.amazon.com/route53/" target="_blank" rel="noopener noreferrer">https://docs.aws.amazon.com/route53/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[44] "AWS Certificate Manager Documentation," AWS. [Online]. Available: </span>
                        <a href="https://docs.aws.amazon.com/acm/" target="_blank" rel="noopener noreferrer">https://docs.aws.amazon.com/acm/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[45] "AWS Identity and Access Management Documentation," AWS. [Online]. Available: </span>
                        <a href="https://docs.aws.amazon.com/iam/" target="_blank" rel="noopener noreferrer">https://docs.aws.amazon.com/iam/</a>. [Accessed: 21-Apr-2024].
                    </div>
                    <div className="source">
                        <span>[46] G. Gevendra, "gevstack," GitHub. [Online]. Available: </span>
                        <a href="https://github.com/gevendra2004/gevstack" target="_blank" rel="noopener noreferrer">https://github.com/gevendra2004/gevstack</a>. [Accessed: 21-Apr-2024].
                    </div>
                </div>

                <div className="sources">
                    <h2>
                        Project Development Disclaimer
                    </h2>
                    <h3>
                        This website has been developed with the integration of Artificial Intelligence (AI) technologies to 
                        enhance the coding process, resolve programming challenges, and improve overall functionality. We 
                        have utilized AI to assist in several key aspects of development, including but not limited to coding 
                        specific functions, debugging, simplifying complex code segments, navigating through the development 
                        of sophisticated algorithms, and identifying relevant technical resources.
                        <br></br><br></br>
                        The use of AI in this project is intended to foster innovation, elevate the efficiency of the development 
                        process, and enhance the quality of the user experience. It is important for users to understand that while 
                        AI has played a significant role in the development of this website, the core architectural decisions, 
                        design, and ultimate responsibility for the website's content and functionality rest with human developers.
                        <br></br><br></br>
                        Additionally, this project incorporates open-source CSS and HTML code sourced from various full-stack 
                        web developers on GitHub. All utilized open-source materials have been properly accredited in accordance 
                        with the original creators' licensing agreements. This approach not only supports the open-source community 
                        but also ensures compliance with legal and ethical standards.
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default CreditsPage;
